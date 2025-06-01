import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function View() {
    const [error, setError] = useState({});
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        image: "",
        phone: "",
        gender: "",
        birthDate: "",
        university: "",
        bloodGroup: "",
        eyeColor: "",
        hair: {
            color: "",
            type: ""
        },
        height: "",
        weight: ""
    });

    const { id } = useParams();  // Get user ID from URL
    const navigate = useNavigate();

    // Fetch user data on mount if ID is present
    
    useEffect(() => {
        if (id) {
            const fetchUser = async () => {
                try {
                    const res = await axios.get(`http://localhost:3000/users/${id}`);
                    const user = res.data;
                    console.log("first",id)
                    console.log('User data:', user);  // Debug log

                    setData({
                        firstName: user.firstName || "",
                        lastName: user.lastName || "",
                        email: user.email || "",
                        image: user.image || "",
                        phone: user.phone || "",
                        gender: user.gender || "",
                        birthDate: user.birthDate ? user.birthDate.slice(0, 10) : "",
                        university: user.university || "",
                        bloodGroup: user.bloodGroup || "",
                        eyeColor: user.eyeColor || "",
                        hair: {
                            color: user.hair?.color || "",
                            type: user.hair?.type || ""
                        },
                        height: user.height || "",
                        weight: user.weight || ""
                    });
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                }
            };
            fetchUser();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "hairColor" || name === "hairType") {
            setData((prev) => ({
                ...prev,
                hair: {
                    ...prev.hair,
                    [name === "hairColor" ? "color" : "type"]: value
                }
            }));
        } else if (name === "image" && files.length > 0) {
            const file = files[0];
            setData((prev) => ({
                ...prev,
                image: URL.createObjectURL(file)
            }));
        } else {
            setData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`http://localhost:3000/users/${id}`, data);
            console.log('Update response:', res.data);

            if (res.data.errors) {
                setError(res.data.errors);
            } else {
                setError({});
                alert('Data updated successfully!');
                navigate('/');
            }
        } catch (error) {
            console.error('Error while updating:', error);
            alert('Failed to update data.');
        }
    };

    return (
        <div className="form-container">
            <div className="registration-form">
                <form onSubmit={handleSubmit}>
                    <h1>Registration Form</h1>

                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="First Name"
                            name="firstName"
                            value={data.firstName}
                            onChange={handleChange}
                        />
                        <p className="err">{error.firstName}</p>
                    </div>

                    <div className="form-group">
                        {data.image && (
                            <img
                                src={data.image.startsWith('blob')
                                    ? data.image
                                    : `http://localhost:3000/uploads/${data.image}`
                                }
                                alt="Preview"
                                width="100"
                            />
                        )}
                        <input
                            type="file"
                            name="image"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Last Name"
                            name="lastName"
                            value={data.lastName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={data.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="number"
                            placeholder="Number"
                            name="phone"
                            value={data.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <p>Select Gender:</p>
                    <div className="gender-group">
                        <label>
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={data.gender === 'male'}
                                onChange={handleChange}
                            />
                            Male
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={data.gender === 'female'}
                                onChange={handleChange}
                            />
                            Female
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="gender"
                                value="other"
                                checked={data.gender === 'other'}
                                onChange={handleChange}
                            />
                            Other
                        </label>
                    </div>

                    <div className="form-group">
                        <input
                            type="date"
                            name="birthDate"
                            value={data.birthDate}
                            onChange={handleChange}
                        />
                    </div>

                    <p className="personl">Personal Details:</p>
                    <div className="personalDetailsContainer">
                        <div className="per">
                            <div className="form-group">
                                <label>Blood Group:</label>
                                <select
                                    name="bloodGroup"
                                    value={data.bloodGroup}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="O">O</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="A+">A+</option>
                                    <option value="AB+">AB+</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Eye Color:</label>
                                <select
                                    name="eyeColor"
                                    value={data.eyeColor}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Eye Color</option>
                                    <option value="Brown">Brown</option>
                                    <option value="Blue">Blue</option>
                                    <option value="Green">Green</option>
                                    <option value="Hazel">Hazel</option>
                                </select>
                            </div>
                        </div>

                        <div className="per">
                            <div className="form-group">
                                <label>Hair Color:</label>
                                <select
                                    name="hairColor"
                                    value={data.hair.color}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Hair Color</option>
                                    <option value="Black">Black</option>
                                    <option value="Brown">Brown</option>
                                    <option value="Blonde">Blonde</option>
                                    <option value="Red">Red</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Height (cm):</label>
                                <select
                                    name="height"
                                    value={data.height}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Height</option>
                                    <option value="150">150</option>
                                    <option value="160">160</option>
                                    <option value="170">170</option>
                                    <option value="180">180</option>
                                </select>
                            </div>
                        </div>

                        <div className="per">
                            <div className="form-group">
                                <label>Weight (kg):</label>
                                <select
                                    name="weight"
                                    value={data.weight}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Weight</option>
                                    <option value="50">50</option>
                                    <option value="60">60</option>
                                    <option value="70">70</option>
                                    <option value="80">80</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Hair Type:</label>
                                <select
                                    name="hairType"
                                    value={data.hair.type}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Hair Type</option>
                                    <option value="Straight">Straight</option>
                                    <option value="Wavy">Wavy</option>
                                    <option value="Curly">Curly</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Education"
                            name="university"
                            value={data.university}
                            onChange={handleChange}
                        />
                    </div>

                    <button className="submit-btn" type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default View;
