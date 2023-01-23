import {
  SET_LOADING,
  SET_CONTACT,
  CONTACT_TO_UPDATE,
  SET_SINGLE_CONTACT,
} from "./action.types";

export default (state, action) => {
  switch (action.type) {
    case SET_CONTACT:
      return action.payload == null
        ? { ...state, contacts: [] }
        : { ...state, contacts: action.payload };

    case SET_LOADING:
      return { ...state, isLoading: action.payload };

    case CONTACT_TO_UPDATE:
      return {
        ...state,
        contactTOUpdate: action.payload,
        contactTOUpdateKey: action.key,
      };

    case SET_SINGLE_CONTACT:
      return {
        ...state,
        contact: action.payload,
      };

    default:
      return state;
  }
};
