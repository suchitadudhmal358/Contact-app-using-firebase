import React, { useState, useContext, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
  Row,
  Col,
} from "reactstrap";

import { readAndCompressImage } from "browser-image-resizer";
import { MdAddCircleOutline } from "react-icons/fa";
import { v4 } from "uuid";

import { ContactContext } from "../context/Context";
import { CONTACT_TO_UPDATE } from "../context/action.types";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { imageConfig } from "../utils/config";
import { getDatabase, set, ref, get } from "firebase/database";

const AddContact = () => {
  const { state, dispatch } = useContext(ContactContext);
  const { contactToUpdate, contactToUpdateKey } = state;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [star, setStar] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    if (contactToUpdate) {
      setName(contactToUpdate.name);
      setEmail(contactToUpdate.email);
      setPhoneNumber(contactToUpdate.phoneNumber);
      setAddress(contactToUpdate.address);
      setStar(contactToUpdate.star);
      setDownloadUrl(contactToUpdate.picture);

      setIsUpdate(true);
    }
  }, [contactToUpdate]);

  const imagePicker = async (e) => {
    try {
      const file = e.target.files[0];
      var metadata = {
        contentType: file.type,
      };

      let resizedImage = await readAndCompressImage(file, imageConfig);
      const storageRef = getStorage().ref();
      var uploadTask = storageRef
        .child("images/" + file.name)
        .put(resizedImage, metadata);

      uploadTask.on(
        getStorage().TaskEvent.STATE_CHANGED,
        (snapshot) => {
          setIsUploading(true);
          var progress = (snapshot.byteTransferred / snapshot.totalBytes) * 100;

          switch (snapshot.state) {
            case getStorage().TaskEvent.PAUSED:
              setIsUploading(false);
              console.log("Uploading is paused");
              break;
            case getStorage().TaskEvent.RUNNING:
              setIsUploading(false);
              console.log("Uploading is in progress");
              break;
          }

          if (progress == 100) {
            setIsUploading(false);
            toast("Uploaded", { type: "success" });
          }
        },
        (error) => {
          toast("something is wrong in state change", { type: "error" });
        },
        () => {
          uploadTask.snapshot.ref
            .getDownloadURL()
            .then((downloadUrl) => {
              setDownloadUrl(downloadUrl);
            })
            .catch((err) => console.log(err));
        }
      );
    } catch (error) {
      console.error(error);
      toast("Something went wrong", { type: "error" });
    }
  };

  const addContact = async () => {
    //TODO: add contact method
    try {
      set(ref(getDatabase(), "contacts/" + v4()), {
        name,
        email,
        phoneNumber,
        address,
        picture: downloadUrl,
        star,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // to handle update the contact when there is contact in state and the user had came from clicking the contact update icon
  const updateContact = async () => {
    //TODO: update contact method
    try {
      set(ref(getDatabase(), "contacts/" + contactToUpdateKey), {
        name,
        email,
        phoneNumber,
        address,
        picture: downloadUrl,
        star,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // firing when the user click on submit button or the form has been submitted
  const handleSubmit = (e) => {
    e.preventDefault();

    isUpdate ? updateContact() : addContact();
    toast("Success", { type: "success" });

    // isUpdate wll be true when the user came to update the contact
    // when their is contact then updating and when no contact to update then adding contact
    //TODO: set isUpdate value

    // to handle the bug when the user visit again to add contact directly by visiting the link
    dispatch({
      type: CONTACT_TO_UPDATE,
      payload: null,
      key: null,
    });

    // after adding/updating contact then sending to the contacts
    // TODO :- also sending when their is any errors
    navigate("/");
  };

  // return the spinner when the image has been added in the storage
  // showing the update / add contact based on the  state
  return (
    <Container fluid className="mt-5">
      <Row>
        <Col md="6" className="offset-md-3 p-2">
          <Form onSubmit={handleSubmit}>
            <div className="text-center">
              {isUploading ? (
                <Spinner type="grow" color="primary" />
              ) : (
                <div>
                  <label htmlFor="imagepicker" className="">
                    <img src={downloadUrl} alt="" className="profile" />
                  </label>
                  <input
                    type="file"
                    name="image"
                    id="imagepicker"
                    accept="image/*"
                    multiple={false}
                    onChange={(e) => imagePicker(e)}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <FormGroup>
              <Input
                type="text"
                name="name"
                id="name"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="number"
                name="number"
                id="phonenumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="phone number"
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="textarea"
                name="area"
                id="area"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="address"
              />
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="checkbox"
                  onChange={() => {
                    setStar(!star);
                  }}
                  checked={star}
                />{" "}
                <span className="text-right">Mark as Star</span>
              </Label>
            </FormGroup>
            <Button
              type="submit"
              color="primary"
              block
              className="text-uppercase"
            >
              {isUpdate ? "Update Contact" : "Add Contact"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AddContact;
