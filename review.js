import React from 'react';
import { useContext, useReducer } from 'react';
// If you are using context exported from another parent component
// import { SampleContext } from '../../App';
// import { SampleDispatchContext } from '../../App';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import './App.css';

/*==========================================================================================*/
export const  = React.createContext(); 

export const  = React.createContext();


export const Resume = (props) => { 


// If you are using context exported from another parent component
// const session = useContext(SampleContext);
// const dispatch = useContext(SampleDispatchContext);


            
            // This useReducer hook can call local functions to handle the requested actions if necessary
            function s(state, action) {
                switch (action.type) {
                case 'Case1':
                    return newState;
                case 'Case2':
                    return newState;
                case 'Case3':
                    return newState;        
                default:
                    return newState;
                }
            }
            
            // sample initialState1
            const initialState1 = {
                user: "",
                password: "",
                loggedin: false,
            }
            
            const [sampleState1, dispatch1] = useReducer(, initialState1);
            
            
        // A typical _handleChange controlled form field handler
        const _handleChange = (event) => {
            setFormValues1((prevState) => {
              // console.log(prevState)
              return {
                ...prevState,
                [event.target.id]: event.target.value,
              };
            });
          };

          // A typical onBlur form field change validation handler
          const _handleVerifyForm = (event) => {
              if (formValues1.password !== formValues1.confirm_password) {
                  setFormError1(true);
              } else {
                  setFormError1(false);
              }     
          }

          // example handle user registration request via API post
          
          const _handleRegistration = async (event) => {

              event.preventDefault();          
              const API_URI='http:// localhost:4000/register';
          
              try {
                  const response = await fetch(API_URI, {
                      "method": 'POST',
                      "body": JSON.stringify(formValues1),
                      "headers": {
                          "Content-Type": 'application/json'
                      }
                  });
          
                  const data = await response.json();                  
                  if ( (response.status===200) || (response.status===201) ) {
                      setFormValues1(initialFormValues1);
                  }
                  else {
                    console.error('Registration Failed');
                  }                  
              } catch(error) {
                console.error(error);
              }
          
            } 
                    
    
      return (
     
        <div className="resume-container">
        <Samplecontext1.Provider value={sampleState1} > 
    <Sampledispatchcontext1.Provider value={dispatch1} > 

        <>
        <Form onSubmit={_handleRegistration}>

        <Form.Group className="mb-3" controlId="email">
        <Form.Label>*Email address</Form.Label>
        <Form.Control type="email" onChange={_handleChange} value={formValues1.email} placeholder="name@example.com" required/>
        </Form.Group>

        <Form.Group className="mb-3" controlId="first_name">
        <Form.Label>*First Name</Form.Label>
        <Form.Control type="text" onChange={_handleChange} value={formValues1.first_name} placeholder="First Name Required" required />
        </Form.Group>

        <Form.Group className="mb-3" controlId="last_name">
        <Form.Label>*Last Name</Form.Label>
        <Form.Control type="last_name" onChange={_handleChange} value={formValues1.last_name} placeholder="Last Name Required" required />
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
        <Form.Label>*Select Password</Form.Label>
        <Form.Control type="password" onChange={_handleChange} value={formValues1.password} placeholder="Password Required" required />
        </Form.Group>

        <Form.Group className="mb-3" controlId="confirm_password">
        <Form.Label>*Confirm Password</Form.Label>
        <Form.Control type="password" onChange={_handleChange} onBlur={_handleVerifyForm} value={formValues1.confirm_password} placeholder="Confirm Password Required" required />
        </Form.Group>
        {formError && <Alert variant='danger'>Passwords must match!</Alert>}

        <Button variant="primary" type="submit" disabled={formError}>
        Submit Registration Form
        </Button>

        </Form>

        </>

            </undefined.Provider>
    </undefined.Provider>

        </div>
      );
      
    }
    
    export default Resume;
    
    