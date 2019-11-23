import React from 'react';
import './App.scss';

// Employee Dashboard
class EmployeeDashboard extends React.Component {
  state = {
    employees: [],
    searchQuery: ''
  }

  // Edit employee
  editEmployee = (attrs) => {
    // console.log(attrs);
    this.setState({
      employees: this.state.employees.map((emp) => {
        if(emp.id === attrs.id) {
          return Object.assign({}, emp, {position: attrs.position});
        }
        else {
          return emp;
        }
      })
    }, () => {localStorage.setItem('employeesCache', JSON.stringify(this.state.employees))});
  }

  handleEditEmployee = (attrs) => {
    this.editEmployee(attrs);
  }

  //Delete Employee
  deleteEmployee = (empId) => {
    this.setState({
      employees: this.state.employees.filter(emp => emp.id !== empId),
    }, () => {localStorage.setItem('employeesCache', JSON.stringify(this.state.employees))})
  }

  handleDeleteEmployee = (empId) => {
    if(window.confirm("Are you sure you want to delete this employee?")) {
      this.deleteEmployee(empId);    
    }
  }

  fetchFromJson = () => {
    fetch(`employees.json`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      this.setState({employees: data.employees})
    }); 
  }

  fetchSearchResults = (e) => {
    this.setState({
      searchQuery: e.searchText
    })
  }

  //Fetching the employee data from a .json file
  componentDidMount() {
    if(localStorage.getItem('employeesCache') != null) {
      this.setState({
        employees: JSON.parse(localStorage.getItem('employeesCache'))
      })
    }
    else {
      this.fetchFromJson();
    }
  }

  render() {
    let {employees, searchQuery} = this.state;
    return (
      <div className="empl-dash">
        <h2>My Company's List</h2>
        <EmployeeSearch 
          onChange={this.fetchSearchResults}
        />
        <EditableEmployeeList 
          searchQuery={searchQuery}
          employees={employees}
          onFormSubmit={this.handleEditEmployee}
          onDeleteEmployee={this.handleDeleteEmployee}
        />
      </div>
    );
  }
}

// EmployeeSearch
class EmployeeSearch extends React.Component {
  state = {
    searchText: ''
  }

  handleLiveSearch = (e) => {
    this.setState({
      searchText: e.target.value
    }, 
    () => {
      this.props.onChange({
        searchText: this.state.searchText
      })
    }) 
  }

  render() {
    return (
      <div className="empl-search">
        <input value={this.state.searchText} type="text" placeholder="Search by first name, last name or position..." onChange={this.handleLiveSearch}/>
      </div>
    );
  }
}

// Employee List
class EditableEmployeeList extends React.Component {

  handleDeleteClick = (empId) => {
    this.props.onDeleteEmployee(empId);
  }

  handleEditClick = (attrs) => {
    this.props.onFormSubmit(attrs);
  }

  render() {
    let filteredEmployees = this.props.employees.filter((emp) => {
      return (
        emp.firstName.toLowerCase().indexOf(this.props.searchQuery.toLowerCase()) >= 0 ||
        emp.lastName.toLowerCase().indexOf(this.props.searchQuery.toLowerCase()) >= 0 ||
        emp.position.toLowerCase().indexOf(this.props.searchQuery.toLowerCase()) >= 0
      );
    })

    let employeeComponents = filteredEmployees.map((emp) => (
      <EditableEmployee 
        key={'employee-'+emp.id}
        id={emp.id}
        name={emp.firstName + " " + emp.lastName}
        position={emp.position}
        isBlocked={emp.isBlocked}
        onFormSubmit={this.handleEditClick}
        onDeleteClick={this.handleDeleteClick}
      />
    ));
    return (
      <div className="empl-list">
        {employeeComponents}
      </div>
    );
  }
}

// Editable Employee
class EditableEmployee extends React.Component {
  state = {
    isEditFormOpen: false,
  }

  openEditForm = () => {
    this.setState({
      isEditFormOpen: true
    });
  }

  closeEditForm = () => {
    this.setState({
      isEditFormOpen: false
    });
  }

  handleEditClick = () => {
    this.openEditForm();
  }

  handleSubmit = (attrs) => {
    this.props.onFormSubmit(attrs);
    this.closeEditForm();
  }

  render() {
    let {id, name, position, isBlocked} = this.props;
    if(this.state.isEditFormOpen) {
      return (
        <EmployeeForm 
          id={id}
          name={name}
          position={position}
          onFormSubmit={this.handleSubmit}
          onFormClose={this.closeEditForm}
        />
      );
    } 
    else {
      return (
        <Employee
          id={id}
          name={name}
          position={position}
          isBlocked={isBlocked}
          onEditClick={this.handleEditClick}
          onDeleteClick={this.props.onDeleteClick}
        />
      );
    } 
  }
}

// EmployeeForm
class EmployeeForm extends React.Component {
  
  state = {
    position: '' || this.props.position
  }

  handlePositionChange = (e) => {
    this.setState({
      position: e.target.value
    });
  }

  handleSubmit = () => {
    if(this.state.position.length !== 0) {
      this.props.onFormSubmit({
        id: this.props.id,
        position: this.state.position
      });
    }
    else {
      alert("Please enter employee's position");
    }
  }

  render() {
    return (
      <div className="empl-card empl-form">
        <label>Modify {this.props.name}'s position:</label>
        <input 
          value={this.state.position}
          type="text" 
          placeholder="Enter employee's position" 
          onChange={this.handlePositionChange}
        />
        <div className="button-group">
          <button 
            onClick={this.handleSubmit} 
            className="button primary">Edit Changes
          </button>
          <button 
            onClick={this.props.onFormClose} 
            className="button danger secondary">Cancel
          </button>
        </div>
      </div>
    );
  }
}

// Employee
class Employee extends React.Component {

  handleEditClick = () => {
    this.props.onEditClick();
  }

  handleDeleteClick = () => {
    this.props.onDeleteClick(this.props.id);
  }

  render() {
    let {name, position, isBlocked} = this.props;

    return (
      <div className="empl-card">
        <div className="details">
          <div className="img"></div>
          <div className="content">
            <h3>{name}</h3>
            <p>{position}</p>
          </div>
        </div>
        <div className="button-group">
          <button onClick={this.handleEditClick} className="button primary">
            <i className="fas fa-edit"></i>
          </button>
          {
            isBlocked 
            ? <button className="button disabled">
                <i className="fas fa-trash"></i>
              </button>
            : <button onClick={this.handleDeleteClick} className="button danger">
                <i className="fas fa-trash"></i>
              </button>
          }
        </div>
      </div>
    );
  }
}

function App() {
  return (
    <div className="App">
      <EmployeeDashboard />      
    </div>
  );
}

export default App;
