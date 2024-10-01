import axios from 'axios';
import React, { useEffect, useState } from 'react';
import CheckLogin from './CheckLogin';
// import './EmployeeAdmin.css';

const EmployeeAdmin = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editableEmployee, setEditableEmployee] = useState(null);
    const [editedFirstname, setEditedFirstname] = useState('');
    const [editedLastname, setEditedLastname] = useState('');
    const [editedUsername, setEditedUsername] = useState('');
    const [editedPassword, setEditedPassword] = useState('');
    const [editedIsManager, setEditedIsManager] = useState('');
    const [editedIsAdmin, setEditedIsAdmin] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedIsEmployed, setEditedIsEmployed] = useState('');


    const [isNewEmployee, setIsNewEmployee] = useState(false);


    const fetchData = async () => {
        try {
            const response = await axios.get('https://project-3-906-03.onrender.com/employees');
            const sortedEmployees = response.data.sort((a, b) => a.employeeid - b.employeeid);
            setEmployees(sortedEmployees);
            setLoading(false);
        } catch (error) {
            setError('Error fetching employees: ' + error.message);
            setLoading(false);
        }
    };
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://project-3-906-03.onrender.com/employees');
                const sortedEmployees = response.data.sort((a, b) => a.employeeid - b.employeeid);
                setEmployees(sortedEmployees);
                setLoading(false);
            } catch (error) {
                setError('Error fetching employees: ' + error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!editedIsEmployed) {
            setEditedIsManager(false);
            setEditedIsAdmin(false);
        }
    }, [editedIsEmployed]);
    

    const handleNewEmployeeClick = () => {
        setIsNewEmployee(true);
        setEditableEmployee(null);
        resetEditFields();
    };

    const handleEditClick = (employee) => {
        setEditableEmployee(employee);
        setEditedFirstname(employee.firstname);
        setEditedLastname(employee.lastname);
        setEditedUsername(employee.username);
        setEditedPassword(employee.password);
        setEditedIsManager(employee.ismanager);
        setEditedIsAdmin(employee.isadmin);
        setEditedEmail(employee.email);
        setEditedIsEmployed(employee.isemployed)
    };

    const resetEditFields = () => {
        setEditedFirstname('');
        setEditedLastname('');
        setEditedUsername('');
        setEditedPassword('');
        setEditedIsManager(false);
        setEditedIsAdmin(false);
        setEditedEmail('');
        setEditedIsEmployed(true);
    };

    const handleCancelClick = (e) => {
        e.preventDefault();
        if (isNewEmployee) {
            setIsNewEmployee(false);
        } else {
            setEditableEmployee(null);
            resetEditFields();
        }
    };

    const handleSaveClick = async (e) => {
        e.preventDefault();
        try {
            if (isNewEmployee) {

                const isManager = editedIsManager !== undefined ? editedIsManager : false;
                const isAdmin = editedIsAdmin !== undefined ? editedIsAdmin : false;
                const isEmployed = editedIsEmployed !== undefined ? editedIsEmployed : true;

                await axios.post('https://project-3-906-03.onrender.com/employees/add', {
                    firstname: editedFirstname,
                    lastname: editedLastname,
                    username: editedUsername,
                    password: editedPassword,
                    ismanager: isManager,
                    isadmin: isAdmin,
                    email: editedEmail,
                    isemployed: isEmployed,
                });
            } else {
                await axios.post(`https://project-3-906-03.onrender.com/employees/${editableEmployee.employeeid}/modify`, {
                    firstname: editedFirstname,
                    lastname: editedLastname,
                    username: editedUsername,
                    password: editedPassword,
                    ismanager: editedIsManager,
                    isadmin: editedIsAdmin,
                    email: editedEmail,
                    isemployed: editedIsEmployed,
                });
            }
    
            await fetchData();
    
            setEditableEmployee(null);
            resetEditFields();
            setIsNewEmployee(false);
        } catch (error) {
            setError('Error updating/adding employee: ' + error.message);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="employee-admin-container">
            <CheckLogin 
                checkManager={ false }
                checkAdmin={ true }
            />

            <button className="admin-button" onClick={handleNewEmployeeClick}>New Employee</button>
            <table className="employee-table">
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Username</th>
                        <th>Password</th>
                        <th>Is Manager</th>
                        <th>Is Admin</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                {isNewEmployee && (
                    <tr>
                        <td>
                            New
                        </td>
                        <td>
                            <input
                                type="text"
                                value={editedFirstname}
                                onChange={(e) => setEditedFirstname(e.target.value)}
                            />
                        </td>
                        <td>
                            <input
                                type="text"
                                value={editedLastname}
                                onChange={(e) => setEditedLastname(e.target.value)}
                            />
                        </td>
                        <td>
                            <input
                                type="text"
                                value={editedUsername}
                                onChange={(e) => setEditedUsername(e.target.value)}
                            />
                        </td>
                        <td>
                            <input
                                type="text"
                                value={editedPassword}
                                onChange={(e) => setEditedPassword(e.target.value)}
                            />
                        </td>
                        <td>
                            <input
                                type="checkbox"
                                checked={editedIsManager}
                                onChange={() => setEditedIsManager(!editedIsManager)}
                            />
                        </td>
                        <td>
                            <input
                                type="checkbox"
                                checked={editedIsAdmin}
                                onChange={() => setEditedIsAdmin(!editedIsAdmin)}
                            />
                        </td>
                        <td>
                            <input
                                type="text"
                                value={editedEmail}
                                onChange={(e) => setEditedEmail(e.target.value)}
                            />
                        </td>
                        <td>
                            <input
                                type="checkbox"
                                checked={editedIsEmployed}
                                onChange={() => setEditedIsEmployed(!editedIsEmployed)}
                            />
                        </td>
                        <td>
                            <button onClick={handleSaveClick}>Save</button>
                            <button onClick={handleCancelClick}>Cancel</button>
                        </td>
                    </tr>
                )}
                    {employees.map((employee) => (
                        <tr key={employee.employeeid}>
                            <td>{employee.employeeid}</td>
                            <td>
                                {editableEmployee === employee ? (
                                    <input
                                        type="text"
                                        value={editedFirstname}
                                        onChange={(e) =>
                                            setEditedFirstname(e.target.value)
                                        }
                                    />
                                ) : (
                                    employee.firstname
                                )}
                            </td>
                            <td>
                                {editableEmployee === employee ? (
                                    <input
                                        type="text"
                                        value={editedLastname}
                                        onChange={(e) =>
                                            setEditedLastname(e.target.value)
                                        }
                                    />
                                ) : (
                                    employee.lastname
                                )}
                            </td>
                            <td>
                                {editableEmployee === employee ? (
                                    <input
                                        type="text"
                                        value={editedUsername}
                                        onChange={(e) =>
                                            setEditedUsername(e.target.value)
                                        }
                                    />
                                ) : (
                                    employee.username
                                )}
                            </td>
                            <td>
                                {editableEmployee === employee ? (
                                    <input
                                    type="text"
                                        value={editedPassword}
                                        onChange={(e) =>
                                            setEditedPassword(e.target.value)
                                        }
                                    />
                                ) : (
                                    employee.password
                                )}
                            </td>
                            <td>
                                {editableEmployee === employee ? (
                                    <input
                                        type="checkbox"
                                        checked={editedIsManager}
                                        onChange={() =>
                                            setEditedIsManager(!editedIsManager)
                                        }
    
                                    />
                                ) : (
                                    employee.ismanager ? 'Yes' : 'No'
                                )}
                            </td>
                            <td>
                                {editableEmployee === employee ? (
                                    <input
                                        type="checkbox"
                                        checked={editedIsAdmin}
                                        onChange={() =>
                                            setEditedIsAdmin(!editedIsAdmin)
                                        }
                                    />
                                ) : (
                                    employee.isadmin ? 'Yes' : 'No'
                                )}
                            </td>
                            <td>
                                {editableEmployee === employee ? (
                                    <input
                                        type="text"
                                        value={editedEmail}
                                        onChange={(e) =>
                                            setEditedEmail(e.target.value)
                                        }
                                    />
                                ) : (
                                    employee.email
                                )}
                            </td>
                            <td>
                                {editableEmployee === employee ? (
                                    <button className="admin-button" onClick={() => setEditedIsEmployed(!editedIsEmployed)}>
                                        {editedIsEmployed ? 'Hired' : 'Fired'}
                                    </button>
                                ) : (
                                    employee.isemployed ? 'Hired' : 'Fired'
                                )}
                            </td>
                            <td>
                                {editableEmployee === employee ? (
                                    <>
                                        <button className="admin-button" onClick={handleSaveClick}>Save</button>
                                        <button className="admin-button" onClick={handleCancelClick}>Cancel</button>
                                    </>
                                    ) : (
                                    <button className="admin-button" onClick={() => handleEditClick(employee)}>Edit</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeAdmin;