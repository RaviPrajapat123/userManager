

import React from "react";
import { useState,useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom"; // Importing useLocation and useNavigate
import {
  Add as AddIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import "./Form.css";

const Form = () => {
  // Using useLocation to get the passed user data
  const { state } = useLocation();
  
  const navigate = useNavigate();
    const [selectedFileName, setSelectedFileName] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name); // ✅ Show file name
      setPreviewImage(URL.createObjectURL(file)); // ✅ Preview
    }
  };
  
  // Check the mode ('view' or 'create')
  const mode = state?.mode || "create";
  const user = state?.user || {};
  useEffect(() => {
    if ((mode === "edit"|| mode==="view") && user.image) {
      setPreviewImage(user.image);
      setSelectedFileName("Current Image");
    }
  }, [mode, user]);
  console.log("mode=",mode)
  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm({
    defaultValues: user, // Pre-fill data when in create mode
  });
  // console.log("=",user._id)
  const isEqual = (obj1, obj2) => {
  // simple deep equality for form fields
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};
  const onSubmit = async (data) => {
     if (mode === 'edit') {
    const flatUser = flattenObject(user);
    const flatData = flattenObject(data);
    if (isEqual(flatUser, flatData)) {
      alert("No changes detected. Please modify some fields before submitting.");
      return;
    }
  }
    try {
      const formData = new FormData();
      const flatData = flattenObject(data);

      for (const key in flatData) {
        const value = flatData[key];
        if (value instanceof FileList) {
          formData.append(key, value[0]);
        } else {
          formData.append(key, value);
        }
      }
    

    if (mode === 'edit' && user._id) {
  console.log("Updating user", user._id); // ✅ confirm it's hitting update block
  const res = await axios.put(`http://localhost:3000/users/${user._id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  alert("User updated successfully!");
} else {
  const res = await axios.post('http://localhost:3000/submit', formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  alert("User created successfully!");
}


      reset();
      navigate("/Users");

    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      if (backendErrors && typeof backendErrors === 'object') {
        Object.keys(backendErrors).forEach(field => {
          setError(field, { type: 'server', message: backendErrors[field] });
        });
      } else {
        alert("Error: " + err.message);
        console.error(err);
      }
    }
  };


  // Helper function to flatten nested objects into dot notation
  const flattenObject = (obj, prefix = '', res = {}) => {
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const value = obj[key];
      const prefixedKey = prefix ? `${prefix}.${key}` : key;

      if (value instanceof FileList) {
        res[prefixedKey] = value;
      } else if (typeof value === 'object' && value !== null && !(value instanceof File)) {
        flattenObject(value, prefixedKey, res);
      } else {
        res[prefixedKey] = value; 
      }
    }
    return res;
  };

  return (
    <div className="form-container">
       <h2>{mode === 'view' ? 'User Details' : mode === 'edit' ? 'Edit User' : 'User Registration Form'}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Flat fields */}
        {[
          "firstName", "lastName", "maidenName", "age", "gender", "email",
          "phone", "username", "password", "birthDate", "image", "bloodGroup",
          "height", "weight", "eyeColor", "ip", "macAddress", "university",
          "ein", "ssn", "userAgent", "role"
        ].map((field) => (
          <div key={field} className="form-group">
            {/* {(mode === 'view'|| mode==="edit") && field === 'image' && user?.image && (
      <img 
        src={user.image} 
        alt="User Preview" 
         style={{
          width: "150px", 
          height: "150px",
          borderRadius: "50% ",
          marginBottom: "10px",
          objectFit: "cover",
          border: "1px solid #ccc",
          borderRadius:"50%"
        }}
      />
      
    )} */}
    {/* {mode==="view" && field!=="image" &&(
      <> */}
            {field === "image" ? (
              <>
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "10px",
                      marginBottom: "10px",
                      objectFit: "cover",
                      border: "1px solid #ccc"
                    }}
                  />
                )}
                <input
                  type="file"
                  {...register("image")}
                  onChange={(e) => {
                    handleImageChange(e);
                  }}
                  disabled={mode === "view"}
                />
                 <p className="error">{errors[field]?.message}</p>
                {selectedFileName && <p>Selected: {selectedFileName}</p>}
              </>
            ) : (
              <>
                <input
                  {...register(field)}
                  type={field === "birthDate" ? "date" : "text"}
                  placeholder={field}
                  disabled={mode === "view"}
                />
                <p className="error">{errors[field]?.message}</p>
              </>
            )}
          </div>
        ))}

       

        {/* Nested fields */}
        {[
          ["hair.color", "Hair Color"],
          ["hair.type", "Hair Type"],
          ["address.address", "Address"],
          ["address.city", "City"],
          ["address.state", "State"],
          ["address.stateCode", "State Code"],
          ["address.postalCode", "Postal Code"],
          ["address.coordinates.lat", "Latitude"],
          ["address.coordinates.lng", "Longitude"],
          ["address.country", "Country"],
          ["bank.cardExpire", "Card Expire"],
          ["bank.cardNumber", "Card Number"],
          ["bank.cardType", "Card Type"],
          ["bank.currency", "Currency"],
          ["bank.iban", "IBAN"],
          ["company.department", "Department"],
          ["company.name", "Company Name"],
          ["company.title", "Title"],
          ["company.address.address", "Company Address"],
          ["company.address.city", "Company City"],
          ["company.address.state", "Company State"],
          ["company.address.stateCode", "Company State Code"],
          ["company.address.postalCode", "Company Postal Code"],
          ["company.address.coordinates.lat", "Company Latitude"],
          ["company.address.coordinates.lng", "Company Longitude"],
          ["company.address.country", "Company Country"],
          ["crypto.coin", "Coin"],
          ["crypto.wallet", "Wallet"],
          ["crypto.network", "Network"]
        ].map(([field, label]) => (
          <div key={field} className="form-group">
            <input
              {...register(field)}
              placeholder={label}
              readOnly={mode==="view"}
              disabled={mode === 'view'} // Disable if in view mode
            />
            <p className="error">
              {field.split('.').reduce((acc, key) => acc?.[key], errors)?.message}
            </p>
          </div>
        ))}

        {/* Submit Button */}
        {mode !== 'view' && <button type="submit" className="btn2">{mode === 'edit' ? 'Update' : 'Submit'}</button>}
      </form>
       {/* {mode !== 'view' && <button onClick={() => navigate(-1)} className="submit-btn btn1">Cancel</button>} */}
      {/* {mode === 'view' && ( */}
         <button onClick={() => navigate("/Users")} className="submit-btn btn3" >  {mode === 'view' ? ' Back' : 'Cancel'}</button> 
       {/* )} */}
    </div>
  );
};

export default Form;





// import React, { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import axios from "axios";
// import { useLocation, useNavigate } from "react-router-dom";
// import "./Form.css";

// const Form = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   const mode = state?.mode || "create";
//   const user = state?.user || {};
  
//   const [selectedFileName, setSelectedFileName] = useState("");
//   const [previewImage, setPreviewImage] = useState(null);

//   // Set preview when editing existing user
//   useEffect(() => {
//     if ((mode === "edit"|| mode==="view") && user.image) {
//       setPreviewImage(user.image);
//       setSelectedFileName("Current Image");
//     }
//   }, [mode, user]);

//   const { register, handleSubmit, formState: { errors }, setError, reset } = useForm({
//     defaultValues: user,
//   });

//   const handleImageChange = (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setSelectedFileName(file.name);
//       setPreviewImage(URL.createObjectURL(file));
//     }
//   };

//   const flattenObject = (obj, prefix = '', res = {}) => {
//     for (const key in obj) {
//       if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
//       const value = obj[key];
//       const prefixedKey = prefix ? `${prefix}.${key}` : key;

//       if (value instanceof FileList) {
//         res[prefixedKey] = value;
//       } else if (typeof value === 'object' && value !== null && !(value instanceof File)) {
//         flattenObject(value, prefixedKey, res);
//       } else {
//         res[prefixedKey] = value;
//       }
//     }
//     return res;
//   };

//   const onSubmit = async (data) => {
//   try {
//     // 🔁 Flatten data & existing user
//     const flatData = flattenObject(data);
//     const flatUser = flattenObject(user);

//     // 🧠 Ignore file field for comparison
//     if (flatData.image instanceof FileList || flatData.image instanceof File) {
//       delete flatData.image;
//       delete flatUser.image;
//     }

//     // 🔍 Compare using for...in loop
//     let isSame = true;
//     for (let key in flatData) {
//       if (flatData[key] != flatUser[key]) {
//         isSame = false;
//         break;
//       }
//     }

//     // ✅ If no change, show alert
//     if (isSame && !selectedFileName) {
//       alert("No changes made");
//       return;
//     }

//     // 🧾 Prepare FormData
//     const formData = new FormData();
//     for (const key in flatData) {
//       const value = flatData[key];
//       if (value instanceof FileList) {
//         formData.append(key, value[0]);
//       } else {
//         formData.append(key, value);
//       }
//     }

//     // 🔁 Submit or Update
//     if (mode === "edit" && user._id) {
//       await axios.put(`http://localhost:3000/users/${user._id}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       alert("User updated successfully!");
//     } else {
//       await axios.post("http://localhost:3000/submit", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       alert("User created successfully!");
//     }

//     reset();
//     navigate("/");
//   } catch (err) {
//     const backendErrors = err.response?.data?.errors;
//     if (backendErrors && typeof backendErrors === "object") {
//       Object.keys(backendErrors).forEach((field) => {
//         setError(field, { type: "server", message: backendErrors[field] });
//       });
//     } else {
//       alert("Error: " + err.message);
//       console.error(err);
//     }
//   }
// };
 

//   return (
//     <div className="form-container">
//       <h2>{mode === 'view' ? 'User Details' : mode === 'edit' ? 'Edit User' : 'User Registration Form'}</h2>
//       <form onSubmit={handleSubmit(onSubmit)}>

//         {/* Flat fields */}
//         {[
//           "firstName", "lastName", "maidenName", "age", "gender", "email",
//           "phone", "username", "password", "birthDate", "image", "bloodGroup",
//           "height", "weight", "eyeColor", "ip", "macAddress", "university",
//           "ein", "ssn", "userAgent", "role"
//         ].map((field) => (
//           <div key={field} className="form-group">
//             {field === "image" ? (
//               <>
//                 {previewImage && (
//                   <img
//                     src={previewImage}
//                     alt="Preview"
//                     style={{
//                       width: "150px",
//                       height: "150px",
//                       borderRadius: "10px",
//                       marginBottom: "10px",
//                       objectFit: "cover",
//                       border: "1px solid #ccc"
//                     }}
//                   />
//                 )}
//                 <input
//                   type="file"
//                   {...register("image")}
//                   onChange={(e) => {
//                     handleImageChange(e);
//                   }}
//                   disabled={mode === "view"}
//                 />
//                  <p className="error">{errors[field]?.message}</p>
//                 {selectedFileName && <p>Selected: {selectedFileName}</p>}
//               </>
//             ) : (
//               <>
//                 <input
//                   {...register(field)}
//                   type={field === "birthDate" ? "date" : "text"}
//                   placeholder={field}
//                   disabled={mode === "view"}
//                 />
//                 <p className="error">{errors[field]?.message}</p>
//               </>
//             )}
//           </div>
//         ))}

//         {/* Nested fields */}
//         {[
//           ["hair.color", "Hair Color"],
//           ["hair.type", "Hair Type"],
//           ["address.address", "Address"],
//           ["address.city", "City"],
//           ["address.state", "State"],
//           ["address.stateCode", "State Code"],
//           ["address.postalCode", "Postal Code"],
//           ["address.coordinates.lat", "Latitude"],
//           ["address.coordinates.lng", "Longitude"],
//           ["address.country", "Country"],
//           ["bank.cardExpire", "Card Expire"],
//           ["bank.cardNumber", "Card Number"],
//           ["bank.cardType", "Card Type"],
//           ["bank.currency", "Currency"],
//           ["bank.iban", "IBAN"],
//           ["company.department", "Department"],
//           ["company.name", "Company Name"],
//           ["company.title", "Title"],
//           ["company.address.address", "Company Address"],
//           ["company.address.city", "Company City"],
//           ["company.address.state", "Company State"],
//           ["company.address.stateCode", "Company State Code"],
//           ["company.address.postalCode", "Company Postal Code"],
//           ["company.address.coordinates.lat", "Company Latitude"],
//           ["company.address.coordinates.lng", "Company Longitude"],
//           ["company.address.country", "Company Country"],
//           ["crypto.coin", "Coin"],
//           ["crypto.wallet", "Wallet"],
//           ["crypto.network", "Network"]
//         ].map(([field, label]) => (
//           <div key={field} className="form-group">
//             <input
//               {...register(field)}
//               placeholder={label}
//               readOnly={mode === "view"}
//               disabled={mode === "view"}
//             />
//             <p className="error">
//               {field.split('.').reduce((acc, key) => acc?.[key], errors)?.message}
//             </p>
//           </div>
//         ))}

//         {/* Submit Button */}
//         {mode !== 'view' && (
//           <button type="submit" className="btn2">
//             {mode === 'edit' ? 'Update' : 'Submit'}
//           </button>
//         )}
//       </form>

//       <button onClick={() => navigate(-1)} className="submit-btn btn3">
//         {mode === 'view' ? 'Back' : 'Cancel'}
//       </button>
//     </div>
//   );
// };

// export default Form;

