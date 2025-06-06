import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// import './index.css'
// import App from './App.jsx'
import MUI from "./MUI.jsx";
import Form from "./Form.jsx";
// import View from "./view.jsx";
import BlogForm from "./Blog/BlogForm.jsx";
import BlogTable from "./Blog/BlogTable.jsx";
// import CategoriesFrom from "./Blog/CategoriesForm.jsx";
import CategoriesTable from "./Categories/CategoriesTable.jsx";
// import TagsTable from "./Blog/AllTags/TagsTable.jsx";
import All from "./all.jsx";
import CategoriesForm from "./Categories/CategoriesForm.jsx";
import TagsTable from "./Tags/TagsTable.jsx";
import TagsForm from "./Tags/TagsForm.jsx";
// import Goback from "./goback.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div><All/></div>,
  },  
  {
    path: "/Users",
    element: <div><MUI/></div>,
  },  
  {
    path: "/users/create",
    element: <div><Form/></div>,
  },
  {
    path:"/users/:id/edit", 
    element:<div><Form/></div>
  }
  ,
  {
    path:"/users/:id/view",
    element:<div><Form/></div>

  },{
    path:"/Blog",
    element:<div><BlogTable/></div>
  }
  ,{
    path:"/Blog/Create",
    element:<div><BlogForm/></div>
  }
  ,{
    path:"/Blog/:id/view",
    element:<div><BlogForm/></div>
  }
  ,{
    path:"/Blog/:id/edit",
    element:<div><BlogForm/></div>
  },{
    path:"Categories/:id/view",
    element:<div><CategoriesForm/></div>
  },{
    path:"CategoriesTable",
    element:<div><CategoriesTable/></div>
  }
  // ,
  // {
  //   path:"CategoriesForm",
  //   element:<div><CategoriesForm/></div>
  // }
  ,{
    path:"TagsTable",
    element:<div><TagsTable/></div>
  }
  ,{
    path:"Tags/:id/view",
    element:<div><TagsForm/></div>
  }
]);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </StrictMode>,
)
