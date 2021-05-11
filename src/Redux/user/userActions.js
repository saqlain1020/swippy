import { auth, serverTimestamp } from "../../Firebase/Firebase";
import { firestore } from "../../Firebase/Firebase";
import { SET_USER, UPDATE_USER } from "./userConstants";
import history from "src/Routes/history";
import { notify } from "reapop";
import store from "../store";
import { storage } from "./../../Firebase/Firebase";
import firebase from "src/Firebase/Firebase";

export const setUser = (user) => {
  return {
    type: SET_USER,
    payload: {
      user,
    },
  };
};

export const updateUser = (user) => {
  return {
    type: UPDATE_USER,
    payload: {
      user,
    },
  };
};

const getUserData = async (uid) => {
  try {
    let query = await firestore.collection("users").doc(uid).get();
    let displayPhoto = await getProfilePhoto(uid);
    let data = query.data();
    data.displayPhoto = displayPhoto;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const signin = (email, pass) => async (dispatch) => {
  try {
    let user = await auth.signInWithEmailAndPassword(email, pass);
    let {
      user: { uid },
    } = user;
    dispatch(setUser(await getUserData(uid)));
    history.push("/dashboard/profile");
  } catch (error) {
    dispatch(notify(error.message, "error"));
  }
};

export const signup = (name, email, pass) => async (dispatch) => {
  try {
    let user = await auth.createUserWithEmailAndPassword(email, pass);
    let {
      user: { uid },
    } = user;
    let obj = {
      uid,
      email,
      name,
      createdAt: serverTimestamp,
    };
    await firestore.collection("users").doc(uid).set(obj);
    dispatch(setUser(await getUserData(uid)));
    history.push("/dashboard/profile");
  } catch (error) {
    dispatch(notify(error.message, "error"));
  }
};

export const authListener = () => async (dispatch) => {
  try {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        dispatch(setUser(await getUserData(user.uid)));
      } else {
        dispatch(setUser(null));
      }
    });
  } catch (error) {
    dispatch(notify(error.message, "error"));
  }
};

export const signout = () => async (dispatch) => {
  try {
    await auth.signOut();
    history.push("/auth");
  } catch (error) {
    dispatch(notify(error.message, "error"));
  }
};

export const updateUserInfo = (obj) => async (dispatch) => {
  try {
    console.log(obj);
    await firestore
      .collection("users")
      .doc(store.getState().user.uid)
      .update(obj);
    dispatch(updateUser(obj));
    dispatch(notify("Profile updated", "success"));
  } catch (error) {
    dispatch(notify(error.message, "error"));
  }
};

export const getProfilePhoto = async (uid) => {
  try {
    let ref = storage.child(`/users/images/${uid}.png`);
    let url = await ref.getDownloadURL();
    return url;
  } catch (error) {
    console.log(error);
  }
};

export const uploadProfileImage = (file) => async (dispatch) => {
  try {
    let ref = storage.child(`/users/images/${store.getState().user.uid}.png`);
    await ref.put(file);
    let url = await ref.getDownloadURL();
    dispatch(updateUser({ displayPhoto: url }));
    dispatch(notify("Display Image updated", "success"));
  } catch (error) {
    dispatch(notify(error.message, "error"));
  }
};

export const addSocial = (obj) => async (dispatch) => {
  try {
    let { url, title, icon } = obj;
    //Pushin to array
    await firestore
      .collection("users")
      .doc(store.getState().user.uid)
      .update({
        socialLinks: firebase.firestore.FieldValue.arrayUnion({
          url,
          title,
          icon,
        }),
      });
    //Update local state
    let arr = store.getState().user.socialLinks || [];
    arr.push({
      url,
      title,
      icon,
    });
    await dispatch(
      updateUser({
        socialLinks: arr,
      })
    );
    dispatch(notify("Social Link added...", "success"));
  } catch (error) {
    dispatch(notify(error.message, "error"));
  }
};

export const updateSocials = (obj, index) => async (dispatch) => {
  try {
    let arr = store.getState().user.socialLinks;
    console.log(obj, index);
    arr = arr.map((item, ind) => {
      if (ind === index) {
        return {
          ...item,
          ...obj,
        };
      }
      return item;
    });
    await firestore
      .collection("users")
      .doc(store.getState().user.uid)
      .update({ socialLinks: arr });

    dispatch(updateUser({ socialLinks: arr }));
    dispatch(notify("Social Link updated...", "success"));
  } catch (error) {
    dispatch(notify(error.message, "error"));
  }
};

export const deleteSocial = (index) => async (dispatch) => {
  try {
    let arr = store.getState().user.socialLinks;
    arr = arr.filter((item, ind) => ind !== index);
    await firestore
      .collection("users")
      .doc(store.getState().user.uid)
      .update({ socialLinks: arr });

    dispatch(updateUser({ socialLinks: arr }));
    dispatch(notify("Social Link deleted...", "success"));
  } catch (error) {
    dispatch(notify(error.message, "error"));
  }
};

export const changeDirect = () => async (dispatch) => {
  try {
    let direct = store.getState().user.direct || false;
    direct = !direct;
    await firestore
      .collection("users")
      .doc(store.getState().user.uid)
      .update({ direct });
    dispatch(updateUser({ direct }));
  } catch (error) {
    dispatch(notify(error.message, "error"));
  }
};
