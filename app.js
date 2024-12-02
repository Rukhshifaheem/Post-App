import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDl2-fTBzBsUQ2jqMMNew5aRLOpwZF3huE",
  authDomain: "fir-wb-bb786.firebaseapp.com",
  projectId: "fir-wb-bb786",
  storageBucket: "fir-wb-bb786.appspot.com",
  messagingSenderId: "191015246809",
  appId: "1:191015246809:web:25c044c896fd4c6f3a97c8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log(app);

const auth = getAuth(app);
auth.languageCode = "en";

const db = getFirestore(app);

// DOM elements
const myModals = document.querySelectorAll(".modal");

// Signup Function
async function signup(event) {
  event.preventDefault();
  const emailField = document.getElementById("SignupEmail");
  const passwordField = document.getElementById("SignupPassword");
  const email = emailField.value.trim();
  const password = passwordField.value;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("User signed up:", user);

    // Save user data to Firestore
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      email: user.email,
      createdAt: new Date(),
    });

    M.toast({ html: `Welcome ${user.email}`, classes: "purple lighten-2" });
    emailField.value = "";
    passwordField.value = "";
    M.Modal.getInstance(myModals[0]).close();
  } catch (error) {
    M.toast({ html: error.message, classes: "red" });
  }
}

function haveAccount(event) {
  event.preventDefault();
  M.Modal.getInstance(myModals[0]).close();
}

// Attach event listener to button
document.getElementById("signupButton")?.addEventListener("click", signup);
document
  .getElementById("alreadySignup")
  ?.addEventListener("click", haveAccount);

// Signin Function
async function signin(event) {
  event.preventDefault();
  const emailField = document.getElementById("LoginEmail");
  const passwordField = document.getElementById("LoginPassword");
  const email = emailField.value.trim();
  const password = passwordField.value;

  if (email === "" || password === "") {
    M.toast({
      html: "Please fill out both email and password fields.",
      classes: "red",
    });
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("Signed in successfully:", user);

    emailField.value = "";
    passwordField.value = "";
    M.Modal.getInstance(myModals[1]).close();

    setTimeout(() => {
      window.location.pathname = "./post.html";
    }, 1000);
  } catch (error) {
    M.toast({ html: error.message, classes: "red" });
  }
}

document.getElementById("loginButton")?.addEventListener("click", signin);

// Logout Function
async function logout() {
  try {
    await signOut(auth);
    console.log("Sign-out successful.");
    M.toast({ html: "Sign-out successful.", classes: "purple lighten-2" });

    setTimeout(() => {
      window.location.pathname = "./index.html";
    }, 1000);
  } catch (error) {
    M.toast({ html: error.message, classes: "red" });
  }
}

document.getElementById("signoutButton")?.addEventListener("click", logout);

document.addEventListener("DOMContentLoaded", () => {
  const profileImage = document.getElementById("profileImage");
  const uploadInput = document.getElementById("uploadProfilePic");

  // Trigger the file input when the profile image is clicked
  profileImage.addEventListener("click", () => {
    uploadInput.click();
  });

  // Update the profile image when a file is selected
  uploadInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        profileImage.src = e.target.result; // Set the new image source
      };

      reader.readAsDataURL(file); // Convert the file to a data URL
    }
  });
});

let posts = []; // No initial posts, list starts empty
let selectedBackgroundImage = ''; // To store the selected background image for posts

document.addEventListener("DOMContentLoaded", () => {
  const postForm = document.getElementById("postForm");
  const postList = document.getElementById("postList");

  // Call renderPosts initially (post list is empty)
  renderPosts(posts);

  // Image selection event to change the background for new posts
  const backgroundImages = document.querySelectorAll('.bg-img');

  backgroundImages.forEach(image => {
    image.addEventListener('click', (e) => {
      // Remove border from all images
      backgroundImages.forEach(img => img.style.border = 'none');

      // Add border to the selected image
      const selectedImage = e.target;
      selectedImage.style.border = '2px solid purple';

      // Set the selected background image
      selectedBackgroundImage = selectedImage.src; // Store the selected image source
      console.log("Selected background image:", selectedBackgroundImage);
    });
  });

  // Form submission event to add or edit posts
  postForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get form values (title and content)
    const title = document.getElementById("postTitle").value;
    const content = document.getElementById("postContent").value;
    const postId = document.getElementById("postId").value;

    if (postId) {
      // If postId exists, it means we're editing an existing post
      const postIndex = posts.findIndex(post => post.id === parseInt(postId));
      posts[postIndex].title = title;
      posts[postIndex].content = content;

      // Update the background image only if a new one is selected
      if (selectedBackgroundImage) {
        posts[postIndex].backgroundImage = selectedBackgroundImage;
      }

      document.getElementById("postId").value = ''; // Reset hidden input field for postId
    } else {
      // Otherwise, we're adding a new post
      const newPost = {
        id: new Date().getTime(), // Use timestamp as a unique ID for the post
        title: title,
        content: content,
        backgroundImage: selectedBackgroundImage || '', // Use the selected background or none
      };
      posts.push(newPost);
    }

    // Re-render the posts list with the updated array
    renderPosts(posts);

    // Clear the form
    postForm.reset();
  });
});

// Function to render posts dynamically
function renderPosts(posts) {
  const postListContainer = document.getElementById("postList");

  postListContainer.innerHTML = ""; // Clear the existing posts

  posts.forEach((post) => {
    // Create new post elements
    const postCard = document.createElement("div");
    postCard.classList.add("card", "post-card");
    postCard.setAttribute("data-id", post.id); // Add the post ID as a data attribute for reference

    const postContent = `
      <div class="card-content">
          <span class="card-title">${post.title}</span>
          <p>${post.content}</p>
      </div>
      <div class="card-action">
          <a href="#" class="edit-button purple-text text-lighten-2">Edit</a>
          <a href="#" class="delete-button red-text">Delete</a>
      </div>
    `;

    // Set the background image for the individual post
    if (post.backgroundImage) {
      postCard.style.backgroundImage = `url(${post.backgroundImage})`;
      postCard.style.backgroundRepeat = "no-repeat";
      postCard.style.backgroundSize = "cover";
    }

    postCard.innerHTML = postContent;
    postListContainer.appendChild(postCard);

    // Attach event listeners
    const editButton = postCard.querySelector(".edit-button");
    const deleteButton = postCard.querySelector(".delete-button");

    editButton.addEventListener("click", () => editPost(post.id));
    deleteButton.addEventListener("click", () => deletePost(post.id));
  });
}

// Function to delete a post
function deletePost(postId) {
  // Find and remove the post from the posts array
  posts = posts.filter(post => post.id !== postId);

  // Re-render the posts list with the updated array
  renderPosts(posts);
}

// Function to edit a post
function editPost(postId) {
  const post = posts.find(post => post.id === postId);

  // Populate the form with the post details
  document.getElementById("postTitle").value = post.title;
  document.getElementById("postContent").value = post.content;
  document.getElementById("postId").value = post.id; // Set the post ID in a hidden input field for reference

  // Highlight the background image of the post being edited
  selectedBackgroundImage = post.backgroundImage || '';
}
document.addEventListener("DOMContentLoaded", function () {
  const modals = document.querySelectorAll(".modal");
  M.Modal.init(modals);
});
