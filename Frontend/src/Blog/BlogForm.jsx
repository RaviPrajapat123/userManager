


import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Autocomplete, TextField } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import "./BlogForm.css";

function flattenObject(obj, parentKey = "", result = {}) {
  for (let key in obj) {
    const propName = parentKey ? `${parentKey}.${key}` : key;
    if (typeof obj[key] === "object" && !(obj[key] instanceof File)) {
      flattenObject(obj[key], propName, result);
    } else {
      result[propName] = obj[key];
    }
  }
  return result;
}

function BlogForm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const mode = state?.mode || "create";
  const blog = state?.Blog || {};

  const [selectedFileName, setSelectedFileName] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [usersList, setUsersList] = useState([]);
  // const [tagList, setTagsList] = useState([]);
  const [catogoriesList, setCategoriesList] = useState([]);
  const [tagsList, setTagsList] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      Tags: [],
      Categories: "",
      ...blog,
    },
  });

  console.log("errors=", errors)
  useEffect(() => {
    if ((mode === "edit" || mode === "view") && blog.image) {
      setPreviewImage(blog.image);
      setSelectedFileName("Current Image");
    }
  }, [mode, blog]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/")
      .then((res) => setUsersList(res.data.users))
      .catch((err) => console.error("Failed to fetch users:", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3000/categories")
      .then((res) =>{ setCategoriesList(res.data.categories || [])
      console.log("categories=",res.data.categories)
      })
      .catch((err) => console.error("Failed to fetch Tags:", err));
  }, []);
 
  useEffect(() => {
    axios
      .get("http://localhost:3000/tags")
      .then((res) =>{ setTagsList(res.data.tags || [])
      console.log("Alltags=",res.data.tags)
      })
      .catch((err) => console.error("Failed to fetch Tags:", err));
  }, []);
 
useEffect(() => {
  if ((mode === "edit" || mode === "view") && blog.Tags) {
   
    const normalizedTags = blog.Tags.map(tag => typeof tag === "object" ? tag.name : tag);
    setValue("Tags", normalizedTags);
  }

  if ((mode === "edit" || mode === "view") && blog.Categories) {
    const normalizedCategory = typeof blog.Categories === "object" ? blog.Categories.name : blog.Categories;
    setValue("Categories", normalizedCategory);
  }
}, [blog, mode, setValue]);


  useEffect(() => {
    register("Tags"); // ✅ register Tags field
    // register("Categories"); // ✅ register Category field (if needed)
  }, [register]);

  useEffect(() => {
  const subscription = watch((value, { name }) => {
    if (name === "Tags" && value.Tags?.length > 0) {
      clearErrors("Tags"); // ✅ clear Tags error
    }
    if (name === "Categories" && value.Categories) {
      clearErrors("Categories"); // ✅ clear Categories error
    }
    if (name === "Title" && value.Title?.trim()) {
      clearErrors("Title"); // ✅ clear Title error
    }
    if (name === "Description" && value.Description?.trim()) {
      clearErrors("Description"); // ✅ clear Description error
    }
    if (name === "Author" && value.Author?.trim()) {
      clearErrors("Author"); // ✅ clear Author error
    }
    if (name === "image" && value.image?.trim()) {
      clearErrors("image"); // ✅ clear Author error
    }
  });

  return () => subscription.unsubscribe();
}, [watch, clearErrors]);


 
   const handleImageChange = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    setSelectedFileName(file.name);
    setPreviewImage(URL.createObjectURL(file));

    clearErrors("image"); // ✅ Clear image error
  }
};

  const authorOptions = usersList.map((u) => ({
    label: `${u.firstName} ${u.maidenName} ${u.lastName}`,
    value: `${u.firstName} ${u.maidenName} ${u.lastName}`,
  }));
  // console.log("user=",usersList)
  const categoryOptions = catogoriesList.map((c) => ({
  label: c.name,  // Adjust this key if your category object uses a different field
  value: c.name,
}));
  const tagsOptions = tagsList.map((tag) => ({
  label: tag.name,  // Adjust this key if your tagategory object uses a different field
  value: tag.name,
}));

console.log("tagiop=",tagsOptions)
 const onSubmit = async (data) => {
  try {
    const flatData = flattenObject(data);
    const flatUser = flattenObject(blog);
    const isFileChanged = selectedFileName && selectedFileName !== "Current Image";

    if (!isFileChanged) {
      delete flatData.image;
      delete flatUser.image;
    }

    let isSame = true;
    for (let key in flatData) {
      if (flatData[key] !== flatUser[key]) {
        isSame = false;
        break;
      }
    }

    if (isSame && !isFileChanged) {
      alert("No changes made");
      return;
    }

    const formData = new FormData();
    for (const key in data) {
      const value = data[key];
      if (value instanceof FileList) {
        formData.append(key, value[0]);
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value)); // ✅ Fix here
      } else if (typeof value === "object" && value !== null) {
        for (const nestedKey in value) {
          formData.append(`${key}.${nestedKey}`, value[nestedKey]);
        }
      } else {
        formData.append(key, value);
      }
    }

    if (mode === "edit" && blog._id) {
      await axios.put(`http://localhost:3000/Blog/${blog._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Blog updated successfully!");
    } else {
      await axios.post("http://localhost:3000/Blog/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Blog created successfully!");
    }

    reset();
    navigate("/Blog");
    setPreviewImage(null);
  } catch (err) {
    const backendErrors = err.response?.data?.errors;
    if (backendErrors && typeof backendErrors === "object") {
      Object.keys(backendErrors).forEach((field) => {
        setError(field, { type: "server", message: backendErrors[field] });
      });
    } else {
      alert("Error: " + err.message);
    }
  }
};

  console.log("Errors:", errors); 
  return (
    <div className="form-container">
      <h2>
        {mode === "view"
          ? "Blog Details"
          : mode === "edit"
            ? "Edit Blog"
            : "Blog Create Form"}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="form_inputs">
        { previewImage && (
          <img
            src={previewImage}
            style={{ margin:"0px auto", width: "200px", height: "200px",borderRadius:"50%"}}
            alt="Preview"
          />
        )}

        <input
          type="file"
          {...register("image")}
          onChange={handleImageChange}
          disabled={mode === "view"}
        />
        {errors.image && <p className="error">{errors.image.message}</p>}

        {(mode === "view" || mode === "edit") && <label>Title</label>}
        <input
          type="text"
          {...register("Title")}
          placeholder="Title"
          disabled={mode === "view"}
          style={{backgroundColor:"#f8f9fa", height:"60px"}}
        />
        {errors.Title && <p className="error">{errors.Title.message}</p>}

        {(mode === "view" || mode === "edit") && <label>Description:</label>}
        <textarea
          {...register("Description")}
          placeholder="Description"
          disabled={mode === "view"}
           style={{backgroundColor:"#f8f9fa", height:"60px"}}
        />
        {errors.Description && (
          <p className="error">{errors.Description.message}</p>
        )}

<Autocomplete
  options={categoryOptions}
  getOptionLabel={(option) => option.label}
  value={categoryOptions.find(
    (opt) => opt.value === watch("Categories")
  ) || null}
  onChange={(e, newValue) => {
    if (newValue) setValue("Categories", newValue.value);
  }}
  disabled={mode === "view"}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Select Category"
      placeholder="Search category..."
    />
  )}
/>

{errors.Categories && <p className="error">{errors.Categories.message}</p>}

<Autocomplete
  multiple
  options={tagsOptions}
  getOptionLabel={(option) => option.label}
  value={tagsOptions.filter(opt => (watch("Tags") || []).includes(opt.value))}
  onChange={(e, newValue) => {
    const selectedValues = newValue.map(tag => tag.value);
    setValue("Tags", selectedValues);
  }}
  disabled={mode === "view"}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Select Tags"
      placeholder="Search tags..."
    />
  )}
/>


        {errors.Tags && <p className="error">{errors.Tags.message}</p>}

        {/* {(mode === "view" || mode === "edit") && <label>Author Name:</label>} */}
        <Autocomplete
          options={authorOptions}
          getOptionLabel={(option) => option.label}
          value={authorOptions.find(
            (opt) => opt.value === watch("Author")
          ) || null}
          onChange={(e, newValue) => {
            if (newValue) setValue("Author", newValue.value);
          }}
          disabled={mode === "view"}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Author"
              placeholder="Search author..."
            />
          )}
        />
        {errors.Author && <p className="error">{errors.Author.message}</p>}

        {mode === "view" && (
          <>
            <label>Created At</label>
            <input type="text" {...register("createdAt")} disabled />

            <label>Updated At</label>
            <input type="text" {...register("updatedAt")} disabled />
          </>
        )}

        {mode !== "view" && (
          <button type="submit" className="submitbtn">
            {mode === "edit" ? "Update" : "Create"}
          </button>
        )}
      </form>

      <button onClick={() => navigate("/Blog")} className="submit-btn btn3">
        {mode === "view" ? "Back" : "Cancel"}
      </button>
    </div>
  );
}

export default BlogForm;
