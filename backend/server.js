import Fastify from 'fastify';
import cors from '@fastify/cors';
import * as yup from 'yup';
import fs from 'fs';
import path from 'path';
import util from 'util';
import pumpCallback from 'pump';
import fastifyMultipart from '@fastify/multipart';
import { nanoid } from 'nanoid';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import db from './db.js';
import { ObjectId } from 'mongodb'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });
const pump = util.promisify(pumpCallback);

fastify.register(fastifyMultipart);
fastify.register(fastifyStatic, {
  root: path.join(__dirname, './uploads'),
  prefix: '/uploads',
});
// fastify.register(cors, { origin: '*' });
fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS',"PUT"], // <- allow DELETE here
});


await fastify.register(db);
const collection = fastify.mongo.db.collection('users');
const collection1=fastify.mongo.db.collection("Blogs")
const CategoriesCollection=fastify.mongo.db.collection("Categories")
const TagsCollection=fastify.mongo.db.collection("Tags")
// Function to expand flat dot-notation fields into nested objects
function expandDotNotation(obj) {
  const result = {};
  for (const key in obj) {
    const keys = key.split('.');
    keys.reduce((res, k, i) => {
      if (i === keys.length - 1) {
        res[k] = obj[key];
      } else {
        res[k] = res[k] || {};
      }
      return res[k];
    }, result);
  }
  return result;
}
 

const yupOptions = {
  strict: false,
  abortEarly: false,
  stripUnknown: true,
  recursive: true,
};

const userSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  maidenName: yup.string().required(),
  age: yup.number().positive().integer().min(18).required(),
   gender: yup
    .string().required('Gender is required'),
  email: yup.string().email().required(),
   phone: yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  birthDate: yup.string().required(),
  username: yup.string().required(),
  password: yup.string().min(6).required(),
  image: yup.string().required("image is required"),
  
   bloodGroup: yup.string()
    .required('Blood group is required')
    .oneOf(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 'Invalid blood group'),
  height: yup.number().positive().required(),
  weight: yup.number().positive().required(),
  eyeColor: yup.string().required(),
  hair: yup.object().shape({
    color: yup.string().required(),
    type: yup.string().required(),
  }).required(),
  ip: yup.string().required(),
  macAddress: yup.string().required(),
  university: yup.string().required(),
  address: yup.object().shape({
    address: yup.string().required(),
    city: yup.string().required(),
    state: yup.string().required(),
    stateCode: yup.string().required(),
    postalCode: yup.string().required(),
    country: yup.string().required(),
    coordinates: yup.object().shape({
      lat: yup.number().required(),
      lng: yup.number().required(),
    }).required(),
  }).required(),
  bank: yup.object().shape({
    cardExpire: yup.string().required(),
    cardNumber: yup.string().required(),
    cardType: yup.string().required(),
    currency: yup.string().required(),
    iban: yup.string().required(),
  }).required(),
  company: yup.object().shape({
    department: yup.string().required(),
    name: yup.string().required(),
    title: yup.string().required(),
    address: yup.object().shape({
      address: yup.string().required(),
      city: yup.string().required(),
      state: yup.string().required(),
      stateCode: yup.string().required(),
      country: yup.string().required(),
      postalCode: yup.string().required(),
      coordinates: yup.object().shape({
        lat: yup.number().required(),
        lng: yup.number().required(),
      }).required(),
    }).required(),
  }).required(),
  ein: yup.string().required(),
  ssn: yup.string().required(),
  userAgent: yup.string().required(),
  crypto: yup.object().shape({
    coin: yup.string().required(),
    wallet: yup.string().required(),
    network: yup.string().required(),
  }).required(),
  role: yup.string().required(),
});

fastify.get('/', async (req, reply) => {
  const query = req.query.query || '';
  const result = await collection.find(
  //   {
  //   $or: [
  //     { firstName: { $regex: query, $options: 'i' } },
  //     { email: { $regex: query, $options: 'i' } },
  //   ],
  // }
).toArray();
  reply.send({
    users: result,
    total: result.length,
    skip: 0,
    limit: 30,
  });
});

fastify.post('/submit', async (req, reply) => {
  const parts = req.parts();
  const bodyFields = {};

  // Handling form data
  for await (const part of parts) {
    if (part.file) {
      const filename = `${nanoid()}-${part.filename}`;
      const filepath = path.join(__dirname, 'uploads', filename);
      await pump(part.file, fs.createWriteStream(filepath));
      bodyFields.image = `http://localhost:3000/uploads/${filename}`;
    } else {
      bodyFields[part.fieldname] = part.value;  
    }
  }

  // Convert flat dot-notation fields to nested objects
  const expandedBody = expandDotNotation(bodyFields);

  try {
    // Validate data using yup schema
    const validatedData = userSchema.validateSync(expandedBody, yupOptions);
    const result = await collection.insertOne(validatedData);
  
    // Send success response
    reply.send({
      status: 200,
      message: 'User created and file uploaded successfully!',
      imageUrl: bodyFields.image,
      data: result,
    });
  } catch (err) {
    const errors = {};
    if (err.inner) {
      err.inner.forEach((e) => {
        if (!errors[e.path]) {
          errors[e.path] = e.message;
        }
      });
    } else {
      errors.general = err.message;
    }
    // Send error response
    reply.status(400).send({ errors });
  }
});

fastify.put('/users/:id', async (req, reply) => {
  const { id } = req.params;
  const parts = req.parts();
  const updateFields = {};

  try {
    // Parse multipart form data
    for await (const part of parts) {
      if (part.file) {
        const filename = `${nanoid()}-${part.filename}`;
        const filepath = path.join(__dirname, 'uploads', filename);
        await pump(part.file, fs.createWriteStream(filepath));
        updateFields.image = `http://localhost:3000/uploads/${filename}`;
      } else {
        updateFields[part.fieldname] = part.value;
      }
    }

    const expandedFields = expandDotNotation(updateFields);

    // Validate updated data using Yup
    const validatedData = userSchema.validateSync(expandedFields, yupOptions);

    // 🔍 Fetch current user data from DB
    const existingUser = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
      return reply.code(404).send({ message: 'User not found' });
    }

    // ✅ Compare: Check if validatedData is same as existingUser
    const hasChanges = Object.keys(validatedData).some(key => {
      // handle nested objects & trim
      const newVal = typeof validatedData[key] === 'string' ? validatedData[key].trim() : validatedData[key];
      const oldVal = typeof existingUser[key] === 'string' ? existingUser[key].trim() : existingUser[key];
      return newVal !== oldVal;
    });

    if (!hasChanges) {
      return reply.code(400).send({ message: 'No changes detected' });
    }

    // ✅ Proceed to update
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: validatedData }
    );

    if (result.modifiedCount === 0) {
      return reply.code(400).send({ message: 'User not updated' });
    }

    reply.send({ message: 'User updated successfully' });
  } catch (err) {
    console.error("Update error:", err);

    const errors = {};
    if (err.inner) {
      err.inner.forEach((e) => {
        if (!errors[e.path]) {
          errors[e.path] = e.message;
        }
      });
    } else {
      errors.general = err.message;
    }

    reply.status(400).send({ errors });
  }
});



fastify.delete('/users/:id', async (request, reply) => {
  const { id } = request.params;
  try {
    const result = await fastify.mongo.db.collection('users').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return reply.code(404).send({ message: 'User not found' });
    }
    return reply.send({ message: 'User deleted successfully' });
  } catch (error) {
    return reply.code(500).send({ message: 'Server error', error });
  }
});

const blogSchema = yup.object().shape({
  Title: yup.string().required("Title is required"),
  Description: yup.string().required("Description is required"),
  Author: yup.string().required("Author is required"),
  Categories: yup.string().required("Category is required"),
  Tags: yup
  .array()
  .of(yup.string().required("Tag is required"))
  .min(1, "At least one tag is required"),

  // image: yup
  //   .string()
  //   // .url("Image must be a valid URL")
  //   .required("Image URL is required"),
    image: yup.string().required("image url is required"),
     createdAt: yup.string().nullable(), // optional if needed
  updatedAt: yup.string().nullable()

})

fastify.get("/Blog",async(req,reply)=>{
    const query = req.query.query || '';
  const result = await collection1.find(
  //   {
  //   $or: [
  //     { firstName: { $regex: query, $options: 'i' } },
  //     { email: { $regex: query, $options: 'i' } },
  //   ],
  // }
).toArray();
  reply.send({
    users: result,
    total: result.length,
    skip: 0,
    limit: 30,
  });
})
fastify.post('/Blog/submit', async (req, reply) => {
  const parts = req.parts();
  const bodyFields = {};
  let imageUpload = false;
  const tagsArray = [];

  for await (const part of parts) {
    if (part.file) {
      const filename = `${nanoid()}-${part.filename}`;
      const filepath = path.join(__dirname, 'uploads', filename);
      await pump(part.file, fs.createWriteStream(filepath));
      bodyFields.image = `http://localhost:3000/uploads/${filename}`;
      imageUpload = true;
    } else {
      if (part.fieldname === "Tags") {
  try {
    const parsed = JSON.parse(part.value);
    if (Array.isArray(parsed)) {
      parsed.forEach(tag => {
        if (typeof tag === 'string') {
          tagsArray.push(tag.startsWith('#') ? tag : `${tag}`);
        }
      });
    } else if (typeof parsed === 'string') {
      tagsArray.push(parsed.startsWith('#') ? parsed : `${parsed}`);
    }
  } catch {
    // Agar parsing fail ho jaye to direct push kar do with #
    const val = part.value;
    tagsArray.push(val.startsWith('#') ? val : `${val}`);
  }
}

      else if (part.fieldname === "Categories") {
        bodyFields.Categories = part.value;
      } else {
        bodyFields[part.fieldname] = part.value;
      }
    }
  }

  bodyFields.Tags = tagsArray;

  if (!imageUpload) {
    bodyFields.image = undefined;
  }

  try {
    const validatedData = blogSchema.validateSync(bodyFields, { abortEarly: false });
    validatedData.createdAt = new Date().toLocaleString();
    validatedData.updatedAt = new Date().toLocaleString();
    validatedData.created_date=Date.now();
    validatedData.updata_date=Date.now();

    const result = await collection1.insertOne(validatedData);

    reply.send({
      status: 200,
      message: 'Blog created and file uploaded successfully!',
      imageUrl: bodyFields.image,
      data: result,
    });
  } catch (err) {
    const errors = {};
    if (err.inner) {
      err.inner.forEach(e => {
        if (!errors[e.path]) {
          errors[e.path] = e.message;
        }
      });
    } else {
      errors.general = err.message;
    }
    reply.status(400).send({ errors });
  }
});




fastify.put('/Blog/:id', async (req, reply) => {
  const { id } = req.params;
  const parts = req.parts();
  const updateFields = {};
  const tagsArray = [];

  try {
    for await (const part of parts) {
      if (part.file) {
        const filename = `${nanoid()}-${part.filename}`;
        const filepath = path.join(__dirname, 'uploads', filename);
        await pump(part.file, fs.createWriteStream(filepath));
        updateFields.image = `http://localhost:3000/uploads/${filename}`;
      } else {
        if (part.fieldname === "Tags") {
          try {
            const parsed = JSON.parse(part.value);
            if (Array.isArray(parsed)) {
              parsed.forEach(tag => {
                if (typeof tag === 'string') {
                  tagsArray.push(tag.startsWith('#') ? tag : `${tag}`);
                }
              });
            } else if (typeof parsed === 'string') {
              tagsArray.push(parsed.startsWith('#') ? parsed : `${parsed}`);
            }
          } catch {
            const val = part.value;
            tagsArray.push(val.startsWith('#') ? val : `${val}`);
          }
        } else if (part.fieldname === "Categories") {
          updateFields.Categories = part.value;
        } else {
          updateFields[part.fieldname] = part.value;
        }
      }
    }

    if (tagsArray.length) {
      updateFields.Tags = tagsArray;
    }

    updateFields.updatedAt = new Date().toLocaleString();
    updateFields.updata_date = Date.now();

    const existingBlog = await collection1.findOne({ _id: new ObjectId(id) });

    if (!existingBlog) {
      return reply.code(404).send({ message: "Blog not found" });
    }

    const validatedData = blogSchema.validateSync(updateFields, yupOptions);

    const result = await collection1.updateOne(
      { _id: new ObjectId(id) },
      { $set: validatedData }
    );

    if (result.modifiedCount === 0) {
      return reply.code(404).send({ message: 'Blog not updated' });
    }

    reply.send({ message: 'Blog updated successfully' });
  } catch (err) {
    console.error("Update error:", err);

    const errors = {};
    if (err.inner) {
      err.inner.forEach((e) => {
        if (!errors[e.path]) {
          errors[e.path] = e.message;
        }
      });
    } else {
      errors.general = err.message;
    }

    reply.status(400).send({ errors });
  }
});


fastify.delete('/Blog/:id', async (request, reply) => {
  const { id } = request.params;
  try {
    const result = await collection1.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return reply.code(404).send({ message: 'User not found' });
    }
    return reply.send({ message: 'User deleted successfully' });
  } catch (error) {
    return reply.code(500).send({ message: 'Server error', error });
  }
});

fastify.get("/categories", async (req, reply) => {
  try {
    const categories =  await CategoriesCollection.find(
  //   {
  //   $or: [
  //     { firstName: { $regex: query, $options: 'i' } },
  //     { email: { $regex: query, $options: 'i' } },
  //   ],
  // }
).toArray();
    reply.send({ categories });
  } catch (err) {
    reply.status(500).send({ error: "Failed to fetch categories" });
  }
});
const categorySchema = yup.object({
  name: yup.string().required().min(2).max(50),
});

fastify.put("/categories/:id", async (req, reply) => {
  const { id } = req.params;

  try {
    const validated = await categorySchema.validate(req.body);

    const existing = await CategoriesCollection.findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return reply.status(404).send({ error: "Category not found" });
    }

    const updateResult = await CategoriesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: validated.name } }
    );

    if (updateResult.modifiedCount === 0) {
      return reply.status(400).send({ error: "Nothing was updated" });
    }

    reply.send({ message: "Category updated successfully" });
  } catch (err) {
    if (err.name === "ValidationError") {
      return reply.status(400).send({ error: err.errors });
    }
    fastify.log.error(err);
    reply.status(500).send({ error: "Failed to update category" });
  }
});




fastify.post('/categories', async (request, reply) => {
  const schema = yup.object({
    name: yup.string().required().min(2).max(50),
  });

  try {
    const validated = await schema.validate(request.body);

    const normalizedName = validated.name.trim().toLowerCase(); // 👈 normalize input

    // Check duplicate (case-insensitive)
    const existing = await CategoriesCollection.findOne({
      name: { $regex: `^${normalizedName}$`, $options: "i" },
    }); 

    if (existing) {
      return reply.status(400).send({ error: 'Category already exists' });
    }

    // Save category in consistent format (e.g., capitalize first letter if needed)
    await CategoriesCollection.insertOne({ name: validated.name.trim() });

    return reply.send({ message: 'Category added' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return reply.status(400).send({ error: error.errors });
    }
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Internal Server Error' });
  }
});

fastify.delete("/categories/:id", async (req, reply) => {
  const { id } = req.params;

  try {
    const result = await CategoriesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return reply.status(404).send({ error: "Category not found" });
    }

    reply.send({ message: "Category deleted successfully" });
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ error: "Failed to delete category" });
  }
});

const tagSchema = yup.object({
  name: yup.string().required().min(2).max(50),
});
fastify.get('/tags', async (request, reply) => {

  try {
    const tags =  await TagsCollection.find().toArray();
    reply.send({ tags });
  } catch (err) {
    reply.status(500).send({ error: "Failed to fetch Tags" });
  }

})
fastify.post('/tags', async (req, reply) => {
  try {
    const validated = await tagSchema.validate(req.body);
    const tagName = validated.name.trim();

    // ✅ Check if tag with same name exists (case-insensitive)
    const existingTag = await TagsCollection.findOne({
      name: { $regex: `^${tagName}$`, $options: 'i' }
    });

    if (existingTag) {
      return reply.code(400).send({ error: 'Tag already exists' });
    }

    const newTag = {
      name: tagName,
      createdAt: new Date().toLocaleString(),
    };

    const result = await TagsCollection.insertOne(newTag);
    reply.code(201).send({ _id: result.insertedId, ...newTag });
  } catch (err) {
    reply.code(400).send({ error: err.errors?.[0] || 'Failed to create tag' });
  }
});
    fastify.get('/tags/:id', async (req, reply) => {
    try {
     
      const tag = await TagsCollection.findOne({ _id: new ObjectId(req.params.id) });
      if (!tag) return reply.code(404).send({ error: 'Tag not found' });
      reply.send(tag);
    } catch {
      reply.code(400).send({ error: 'Invalid tag ID' });
    }
  });

  fastify.put('/tags/:id', async (req, reply) => {
  const { id } = req.params;

  try {
    const validated = await tagSchema.validate(req.body);
    const updatedName = validated.name.trim();

    const existing = await TagsCollection.findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return reply.status(404).send({ error: "Tag not found" });
    }

    // ✅ Check if there's any actual change (case-insensitive)
    if (existing.name.trim().toLowerCase() === updatedName.toLowerCase()) {
      return reply.status(400).send({ error: "No changes detected" });
    }

    const updateResult = await TagsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: updatedName,
          updatedAt: new Date().toLocaleString(),
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return reply.status(400).send({ error: "Nothing was updated" });
    }

    reply.send({ message: "Tag updated successfully" });
  } catch (err) {
    if (err.name === "ValidationError") {
      return reply.status(400).send({ error: err.errors });
    }
    fastify.log.error(err);
    reply.status(500).send({ error: "Failed to update Tag" });
  }
});


  fastify.delete("/tags/:id", async (req, reply) => {
  const { id } = req.params;

  try {
    const result = await TagsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return reply.status(404).send({ error: "Tags not found" });
    }

    reply.send({ message: "Tags deleted successfully" });
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ error: "Failed to delete Tags" });
  }
});

fastify.listen({ port: 3000 }, (err, addr) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server running at ${addr}`);
});





 