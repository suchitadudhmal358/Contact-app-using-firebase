import React, { useReducer, useEffect } from "react";

import { Container, Col, Row } from "reactstrap";

// react-router-dom3
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Routes,
} from "react-router-dom";

// react toastify stuffs
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// bootstrap css
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// firebase stuffs
//TODO: import firebase config and firebase database
import { firebaseConfig } from "./config/firebaseConfig";
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, remove, set } from "firebase/database";
import { getStorage } from "firebase/storage";

// components
import AddContact from "./pages/AddContact";
import Contacts from "./pages/Contacts";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import ViewContact from "./pages/ViewContact";
import PageNotFound from "./pages/PageNotFound";

// context api stuffs
//TODO: import reducers and contexts
import reducer from "./context/reducer";
import { ContactContext } from "./context/Context";
import { SET_LOADING, SET_CONTACT } from "./context/action.types";

//initlizeing firebase app with the firebase config which are in ./utils/firebaseConfig
//TODO: initialize FIREBASE
const firebase = initializeApp(firebaseConfig);

// first state to provide in react reducer
const initialState = {
  contacts: [],
  contact: {},
  contactToUpdate: null,
  contactToUpdateKey: null,
  isLoading: false,
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // will get contacts from firebase and set it on state contacts array
  const getContacts = async () => {
    // TODO: load existing data
    dispatch({
      type: SET_LOADING,
      paylaod: true,
    });

    const contactRef = await ref(getDatabase(), "/contacts");
    onValue(contactRef, (snapshot) => {
      dispatch({
        type: SET_CONTACT,
        paylaod: snapshot.val(),
      });
      dispatch({
        type: SET_LOADING,
        paylaod: false,
      });
    });
  };

  // getting contact  when component did mount
  useEffect(() => {
    //FIXME: call methods if needed
    getContacts();
  }, []);

  return (
    <Router>
      {/* FIXME: Provider is not configured */}
      <ContactContext.Provider value={{ state, dispatch }}>
        <ToastContainer />
        <Header />
        <Container>
          <Routes>
            <Route exact path="/contact/add" element={<AddContact />} />
            <Route exact path="/contact/view" element={<ViewContact />} />
            <Route exact path="/" element={<Contacts />} />
            <Route exact path="*" element={<PageNotFound />} />
          </Routes>
        </Container>

        <Footer />
      </ContactContext.Provider>
    </Router>
  );
};

export default App;
