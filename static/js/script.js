// =========================================================
// PAGE DETECTION
// =========================================================

const currentPage = window.location.pathname;


// =========================================================
// USER LOGIN PROTECTION
// =========================================================

if (
    currentPage !== "/login" &&
    currentPage !== "/signup" &&
    currentPage !== "/admin" &&
    currentPage !== "/admin/dashboard" &&
    localStorage.getItem("isLoggedIn") !== "true"
) {

    if (
        currentPage === "/" ||
        currentPage === "/explore" ||
        currentPage === "/messages" ||
        currentPage === "/profile" ||
        currentPage === "/notifications" ||
        currentPage === "/settings"
    ) {

        window.location.href = "/login";

    }

}


// =========================================================
// SIGNUP
// =========================================================

const signupForm =
    document.getElementById("signupForm");


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "signupUsername"
                ).value.trim();


            const email =
                document.getElementById(
                    "signupEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "signupPassword"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "signupConfirmPassword"
                ).value;


            const message =
                document.getElementById(
                    "signupMessage"
                );


            if (password !== confirmPassword) {

                message.textContent =
                    "Passwords do not match.";

                return;

            }


            let users =
                JSON.parse(
                    localStorage.getItem(
                        "socialMediaUsers"
                    )
                ) || [];


            const existingUser =
                users.find(
                    user =>
                        user.username === username
                );


            if (existingUser) {

                message.textContent =
                    "Username already exists.";

                return;

            }


            const newUser = {

                username: username,

                email: email,

                password: password

            };


            users.push(newUser);


            localStorage.setItem(
                "socialMediaUsers",
                JSON.stringify(users)
            );


            // Save user to SQLite

            fetch("/save_user", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    username: username,

                    email: email

                })

            })
            .then(response =>
                response.json()
            )
            .then(data => {

                message.textContent =
                    "Account created successfully!";

                setTimeout(
                    function() {

                        window.location.href =
                            "/login";

                    },
                    1000
                );

            })
            .catch(error => {

                console.error(error);

                message.textContent =
                    "Account created successfully!";

                setTimeout(
                    function() {

                        window.location.href =
                            "/login";

                    },
                    1000
                );

            });

        }
    );

}


// =========================================================
// LOGIN
// =========================================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "loginUsername"
                ).value.trim();


            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            const users =
                JSON.parse(
                    localStorage.getItem(
                        "socialMediaUsers"
                    )
                ) || [];


            const user =
                users.find(
                    item =>
                        item.username === username &&
                        item.password === password
                );


            if (user) {

                localStorage.setItem(
                    "isLoggedIn",
                    "true"
                );


                localStorage.setItem(
                    "currentUser",
                    username
                );


                window.location.href = "/";

            }

            else {

                message.textContent =
                    "Invalid username or password.";

            }

        }
    );

}


// =========================================================
// LOGOUT
// =========================================================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function() {

            localStorage.removeItem(
                "isLoggedIn"
            );


            localStorage.removeItem(
                "currentUser"
            );


            window.location.href =
                "/login";

        }
    );

}


// =========================================================
// DISPLAY CURRENT USER
// =========================================================

const currentUser =
    localStorage.getItem(
        "currentUser"
    );


const sidebarUsername =
    document.getElementById(
        "sidebarUsername"
    );


if (
    sidebarUsername &&
    currentUser
) {

    sidebarUsername.textContent =
        "Welcome, " + currentUser + "!";

}


// =========================================================
// CREATE POST
// =========================================================

const postForm =
    document.getElementById(
        "postForm"
    );


if (postForm) {

    postForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const content =
                document.getElementById(
                    "postContent"
                ).value.trim();


            const message =
                document.getElementById(
                    "postMessage"
                );


            const username =
                localStorage.getItem(
                    "currentUser"
                );


            if (!username) {

                alert(
                    "Please login first."
                );

                return;

            }


            if (!content) {

                message.textContent =
                    "Post cannot be empty.";

                return;

            }


            fetch("/create_post", {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    username: username,

                    content: content

                })

            })
            .then(response =>
                response.json()
            )
            .then(data => {

                message.textContent =
                    data.message;


                if (data.success) {

                    document.getElementById(
                        "postContent"
                    ).value = "";


                    setTimeout(
                        function() {

                            window.location.reload();

                        },
                        700
                    );

                }

            })
            .catch(error => {

                console.error(error);

                message.textContent =
                    "Error creating post.";

            });

        }
    );

}


// =========================================================
// LIKE POSTS
// =========================================================

const likeButtons =
    document.querySelectorAll(
        ".like-button"
    );


likeButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const postId =
                    this.getAttribute(
                        "data-post-id"
                    );


                const username =
                    localStorage.getItem(
                        "currentUser"
                    );


                if (!username) {

                    alert(
                        "Please login first."
                    );

                    return;

                }


                fetch("/like_post", {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        post_id: postId,

                        username: username

                    })

                })
                .then(response =>
                    response.json()
                )
                .then(data => {

                    if (data.success) {

                        const count =
                            this.querySelector(
                                ".like-count"
                            );


                        count.textContent =
                            data.count;


                        if (data.liked) {

                            this.innerHTML =
                                "❤️ Liked (<span class='like-count'>" +
                                data.count +
                                "</span>)";

                        }

                        else {

                            this.innerHTML =
                                "❤️ Like (<span class='like-count'>" +
                                data.count +
                                "</span>)";

                        }

                    }

                })
                .catch(error => {

                    console.error(error);

                });

            }
        );

    }
);


// =========================================================
// LOAD COMMENTS
// =========================================================

function loadComments(postId) {

    fetch(
        "/get_comments/" + postId
    )
    .then(response =>
        response.json()
    )
    .then(data => {

        if (!data.success) {
            return;
        }


        const list =
            document.getElementById(
                "comment-list-" + postId
            );


        list.innerHTML = "";


        data.comments.forEach(
            function(comment) {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "comment-item";


                div.innerHTML =
                    "<strong>" +
                    comment.username +
                    "</strong>: " +
                    comment.comment;


                list.appendChild(div);

            }
        );

    })
    .catch(error => {

        console.error(error);

    });

}


// =========================================================
// COMMENT TOGGLE
// =========================================================

const commentToggles =
    document.querySelectorAll(
        ".comment-toggle"
    );


commentToggles.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const postId =
                    this.getAttribute(
                        "data-post-id"
                    );


                const section =
                    document.getElementById(
                        "comments-" + postId
                    );


                if (
                    section.style.display ===
                    "block"
                ) {

                    section.style.display =
                        "none";

                }

                else {

                    section.style.display =
                        "block";


                    loadComments(postId);

                }

            }
        );

    }
);


// =========================================================
// ADD COMMENT
// =========================================================

const commentForms =
    document.querySelectorAll(
        ".comment-form"
    );


commentForms.forEach(
    function(form) {

        form.addEventListener(
            "submit",
            function(event) {

                event.preventDefault();


                const postId =
                    this.getAttribute(
                        "data-post-id"
                    );


                const input =
                    this.querySelector(
                        ".comment-input"
                    );


                const comment =
                    input.value.trim();


                const username =
                    localStorage.getItem(
                        "currentUser"
                    );


                if (!username) {

                    alert(
                        "Please login first."
                    );

                    return;

                }


                if (!comment) {

                    return;

                }


                fetch("/add_comment", {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        post_id: postId,

                        username: username,

                        comment: comment

                    })

                })
                .then(response =>
                    response.json()
                )
                .then(data => {

                    if (data.success) {

                        input.value = "";


                        const list =
                            document.getElementById(
                                "comment-list-" +
                                postId
                            );


                        list.innerHTML = "";


                        data.comments.forEach(
                            function(item) {

                                const div =
                                    document.createElement(
                                        "div"
                                    );


                                div.className =
                                    "comment-item";


                                div.innerHTML =
                                    "<strong>" +
                                    item.username +
                                    "</strong>: " +
                                    item.comment;


                                list.appendChild(
                                    div
                                );

                            }
                        );

                    }

                })
                .catch(error => {

                    console.error(error);

                });

            }
        );

    }
);


// =========================================================
// PROFILE PAGE
// =========================================================

const profileUsername =
    document.getElementById(
        "profileUsername"
    );


const profileAvatar =
    document.getElementById(
        "profileAvatar"
    );


if (
    profileUsername &&
    currentUser
) {

    profileUsername.textContent =
        currentUser;


    profileAvatar.textContent =
        currentUser
        .charAt(0)
        .toUpperCase();

}


// =========================================================
// SETTINGS
// =========================================================

const settingsUsername =
    document.getElementById(
        "settingsUsername"
    );


if (
    settingsUsername &&
    currentUser
) {

    settingsUsername.value =
        currentUser;

}


// =========================================================
// ADMIN LOGIN
// =========================================================

const adminLoginForm =
    document.getElementById(
        "adminLoginForm"
    );


if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "adminUsername"
                ).value;


            const password =
                document.getElementById(
                    "adminPassword"
                ).value;


            const message =
                document.getElementById(
                    "adminLoginMessage"
                );


            if (
                username === "admin" &&
                password === "admin123"
            ) {

                localStorage.setItem(
                    "adminLoggedIn",
                    "true"
                );


                window.location.href =
                    "/admin/dashboard";

            }

            else {

                message.textContent =
                    "Invalid admin credentials.";

            }

        }
    );

}


// =========================================================
// ADMIN DASHBOARD PROTECTION
// =========================================================

if (
    currentPage ===
    "/admin/dashboard"
) {

    if (
        localStorage.getItem(
            "adminLoggedIn"
        ) !== "true"
    ) {

        window.location.href =
            "/admin";

    }

}


// =========================================================
// ADMIN LOGOUT
// =========================================================

const adminLogoutButton =
    document.getElementById(
        "adminLogoutButton"
    );


if (adminLogoutButton) {

    adminLogoutButton.addEventListener(
        "click",
        function() {

            localStorage.removeItem(
                "adminLoggedIn"
            );


            window.location.href =
                "/admin";

        }
    );

}


// =========================================================
// DELETE ADMIN POST
// =========================================================

const deleteButtons =
    document.querySelectorAll(
        ".delete-post-button"
    );


deleteButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const postId =
                    this.getAttribute(
                        "data-post-id"
                    );


                const confirmation =
                    confirm(
                        "Are you sure you want to remove this post?"
                    );


                if (!confirmation) {

                    return;

                }


                fetch(
                    "/admin/delete_post/" +
                    postId,
                    {
                        method: "POST"
                    }
                )
                .then(response =>
                    response.json()
                )
                .then(data => {

                    if (data.success) {

                        alert(
                            "Post removed successfully."
                        );


                        window.location.reload();

                    }

                })
                .catch(error => {

                    console.error(error);

                });

            }
        );

    }
);