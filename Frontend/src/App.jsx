import { useEffect, useState } from 'react'
import axios from "axios"
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// const data = [
//   {
//     id: 1,
//     name: "ravi",
//     email: "ravi@gmail.com",
//     DOB: "3/5/2003",

//   },
//   {
//     id: 2,
//     name: "Lucky",
//     email: "lucky@gmail.com",
//     DOB: "2/3/2001",

//   },
//   {
//     id: 3,
//     name: "Shubham",
//     email: "Shubham@gmail.com",
//     DOB: "3/4/2005",

//   },
//   {
//     id: 4,
//     name: "pankaj",
//     email: "pankaj@gmail.com",
//     DOB: "3/4/2005",

//   },
//   {
//     id: 5,
//     name: "Kushagra",
//     email: "Kushagra@gmail.com",
//     DOB: "3/4/2005",

//   }
// ]

function App() {

  const [users, setUsers] = useState([])
  const [visible, setVisible] = useState(null)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowPerPage, setRowPerpage] = useState(10)


  useEffect(() => {
    axios.get("https://dummyjson.com/users/")
      .then(res => {
        if (res.status === 200) {
          setUsers(res.data.users)
          console.log(res.data)
        }
      })
  }, [])
  // console.log("total",users.length)

  const onView = (id) => {
    console.log(id)
    const user = users.find(u => u.id === id)
    alert(`Viewing:\n${user.maidenName} ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nPhone: ${user.phone}\nGender: ${findGender(user.gender)}\nDOB: ${calculateDob(user.birthDate)}`)
  }
  const onEdit = (id) => {
    const user = users.find(u => u.id === id)
    alert(`Editing:\n${user.maidenName} ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nPhone: ${user.phone}\nGender: ${findGender(user.gender)}\nDOB: ${calculateDob(user.birthDate)}`)
  }
  const onDelete = (id) => {
    setUsers(prev => prev.filter(user => user.id !== id))

    // setVisible(null)
  }
  const findGender = (gen) => {

    let a;
    gen === "male" ? a = "M" : gen === "female" ? a = "F" : a = "O"
    return a
  }
  const calculateDob = (dob) => {
    const [year, month, date] = dob.split("-")
    let m
    const monthNum = parseInt(month)

    switch (monthNum) {
      case 1: m = "Jan";
        break;
      case 2: m = "Feb";
        break;
      case 3: m = "Mar";
        break;
      case 4: m = "Apr";
        break;
      case 5: m = "May";
        break;
      case 6: m = "Jun";
        break;
      case 7: m = "Jul";
        break;
      case 8: m = "Aug";
        break;
      case 9: m = "Sep";
        break;
      case 10: m = "Oct";
        break;
      case 11: m = "Nov";
        break;
      case 12: m = "Dec";
        break;
    }
    return (`${m} ${date}, ${year}`)
  }
  const show = (item) => {
    alert(`
 eyeColor: ${item.eyeColor}
 hair color: ${item.hair.color}
 hair type: ${item.hair.type}
 height: ${item.height}
 weight: ${item.weight}
        `)
  }

  const filteredUsers = users.filter(user => {
    const term = search.toLowerCase().trim()
    return (
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      user.maidenName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.phone.toLowerCase().includes(term) ||
      user.gender.toLowerCase().includes(term) ||
      calculateDob(user.birthDate).toLowerCase().includes(term) ||
      user.university.toLowerCase().includes(term) ||
      user.bloodGroup.toLowerCase().includes(term)
    )
  })
  const indexOfLastItem = currentPage * rowPerPage;
  const indexOfFirstItem = indexOfLastItem - rowPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / rowPerPage);
  const handleRows = (e) => {
    setRowPerpage(Number(e.target.value))
    setCurrentPage(1)
  }

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToFirst = () => {
    setCurrentPage(1);
  };

  const goToLast = () => {
    setCurrentPage(totalPages);
  };

  // escapeRegExp helper: सर्च टर्म में अगर कोई special char हो तो उसे escape कर देगा
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const highlight = (text) => {
  const q = search.trim()
  if (!q) return text

  // 1) सर्च टर्म को escape करके regex बनाएं
  const escaped = escapeRegExp(q)
  const regex = new RegExp(`(${escaped})`, 'gi')

  // 2) text को उस regex से split करें
  return text.split(regex).map((part, i) =>
    // 3) अगर वो हिस्सा regex से match करता है तो <strong>, नहीं तो plain text
    regex.test(part)
      ? <strong key={i}>{part}</strong>
      : part
  )
}


  return (
    <div>
      <div className="header">
        <input type='text'
          placeholder='Search...'
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1)
          }}
        ></input>

        {
          visible ? (<div className="headerBtn">

            <button onClick={() => onView(visible)} className='viewBtn'>view</button><button onClick={() => onEdit(visible)} className='editBtn'>Edit</button><button onClick={() => onDelete(visible)} className='deleteBtn'>Delete</button>
          </div>) : ""
        }
      </div>

      <table>
        <thead>
          <tr>
            <th></th>
            <th>Profile</th>
            <th>Phone</th>
            <th>Gender(M/F)</th>
            <th>DOB</th>
            <th>Personal Details</th>
            <th>Edu</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length ? (currentItems.map((itmes, index) => {
            // console.log(visible)
            return (
              <tr key={index}>
                <td><input type='checkbox'
                  className='checkbox'
                  checked={visible==itmes.id}
                  onChange={() =>
                    setVisible(prev => prev === itmes.id ? null : itmes.id)
                  }
                ></input></td>

                <td className='he'><div className='profileField'>
                  <div className="profileFieldLeft"><img src={itmes.image}></img></div>
                </div>
                  <div className="profileFieldRight">
                    <p>{highlight(`${itmes.maidenName} ${itmes.firstName} ${itmes.lastName}`)}</p>
                    <p>{highlight(itmes.email)}</p>
                  </div>
                </td>
                <td>{highlight(itmes.phone)}</td>
                <td>{highlight(findGender(itmes.gender))}</td>
                <td>{highlight(calculateDob(itmes.birthDate))}</td>
                <td>{highlight(itmes.bloodGroup)}<br /><p onClick={() => show(itmes)} className='show'>Show</p></td>
                <td>{highlight(itmes.university)}</td>

              </tr>
            )
          })) : (<tr><td colSpan={7}>No Data found</td></tr>)}
        </tbody>
      </table>
      <div className="footer">

        <h3> Total: {filteredUsers.length}</h3>
        <div className="pagination">
          <div className="rowsPerPages">
            <select value={rowPerPage} onChange={handleRows}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="pages">
            <button onClick={goToFirst} disabled={currentPage === 1}
              className={currentPage === 1 ? "disabled" : ""}

            >
              First
            </button>
            <button onClick={handlePrev} disabled={currentPage === 1}
              className={currentPage === 1 ? "disabled" : ""}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={currentPage === index + 1 ? "active" : ""}
              >
                {index + 1}
              </button>
            ))}

            <button onClick={handleNext} disabled={currentPage === totalPages}
              className={currentPage === totalPages ? "disabled" : ""}

            >
              Next
            </button>
            <button onClick={goToLast} disabled={currentPage === totalPages}
              className={currentPage === totalPages ? "disabled" : ""}

            >
              Last
            </button>
          </div>
        </div>
      </div>


      {/* </tfoot> */}

    </div>
  )

}

export default App
