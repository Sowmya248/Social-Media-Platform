from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

DATABASE = "database.db"


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


# =========================================================
# CREATE TABLES
# =========================================================

def create_tables():

    connection = get_db_connection()

    cursor = connection.cursor()


    # USERS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT NOT NULL
        )
    """)


    # POSTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)


    # LIKES
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            UNIQUE(post_id, username)
        )
    """)


    # COMMENTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            comment TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)


    connection.commit()

    connection.close()


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():

    connection = get_db_connection()

    posts = connection.execute("""
        SELECT
            posts.*,
            COUNT(DISTINCT likes.id) AS like_count,
            COUNT(DISTINCT comments.id) AS comment_count
        FROM posts
        LEFT JOIN likes
            ON posts.id = likes.post_id
        LEFT JOIN comments
            ON posts.id = comments.post_id
        GROUP BY posts.id
        ORDER BY posts.id DESC
    """).fetchall()

    connection.close()

    return render_template(
        "index.html",
        posts=posts
    )


# =========================================================
# SIGNUP PAGE
# =========================================================

@app.route("/signup")
def signup():
    return render_template("signup.html")


# =========================================================
# LOGIN PAGE
# =========================================================

@app.route("/login")
def login():
    return render_template("login.html")


# =========================================================
# EXPLORE
# =========================================================

@app.route("/explore")
def explore():

    connection = get_db_connection()

    posts = connection.execute("""
        SELECT *
        FROM posts
        ORDER BY id DESC
    """).fetchall()

    connection.close()

    return render_template(
        "explore.html",
        posts=posts
    )


# =========================================================
# MESSAGES
# =========================================================

@app.route("/messages")
def messages():
    return render_template("messages.html")


# =========================================================
# PROFILE
# =========================================================

@app.route("/profile")
def profile():
    return render_template("profile.html")


# =========================================================
# NOTIFICATIONS
# =========================================================

@app.route("/notifications")
def notifications():
    return render_template("notifications.html")


# =========================================================
# SETTINGS
# =========================================================

@app.route("/settings")
def settings():
    return render_template("settings.html")


# =========================================================
# SAVE USER
# =========================================================

@app.route("/save_user", methods=["POST"])
def save_user():

    data = request.get_json()

    username = data.get("username")
    email = data.get("email")


    if not username or not email:

        return jsonify({
            "success": False,
            "message": "Username and email are required."
        })


    connection = get_db_connection()


    try:

        connection.execute("""
            INSERT INTO users
            (username, email)
            VALUES (?, ?)
        """, (username, email))

        connection.commit()

        message = "User saved successfully."


    except sqlite3.IntegrityError:

        message = "User already exists."


    connection.close()


    return jsonify({
        "success": True,
        "message": message
    })


# =========================================================
# CREATE POST
# =========================================================

@app.route("/create_post", methods=["POST"])
def create_post():

    data = request.get_json()

    username = data.get("username")
    content = data.get("content")


    if not username or not content:

        return jsonify({
            "success": False,
            "message": "Username and post content are required."
        })


    connection = get_db_connection()


    connection.execute("""
        INSERT INTO posts
        (username, content)
        VALUES (?, ?)
    """, (username, content))


    connection.commit()

    connection.close()


    return jsonify({
        "success": True,
        "message": "Post created successfully!"
    })


# =========================================================
# LIKE POST
# =========================================================

@app.route("/like_post", methods=["POST"])
def like_post():

    data = request.get_json()

    post_id = data.get("post_id")
    username = data.get("username")


    if not post_id or not username:

        return jsonify({
            "success": False,
            "message": "Missing information."
        })


    connection = get_db_connection()


    existing_like = connection.execute("""
        SELECT *
        FROM likes
        WHERE post_id = ?
        AND username = ?
    """, (post_id, username)).fetchone()


    if existing_like:

        connection.execute("""
            DELETE FROM likes
            WHERE post_id = ?
            AND username = ?
        """, (post_id, username))

        liked = False


    else:

        connection.execute("""
            INSERT INTO likes
            (post_id, username)
            VALUES (?, ?)
        """, (post_id, username))

        liked = True


    connection.commit()


    like_count = connection.execute("""
        SELECT COUNT(*) AS count
        FROM likes
        WHERE post_id = ?
    """, (post_id,)).fetchone()["count"]


    connection.close()


    return jsonify({
        "success": True,
        "liked": liked,
        "count": like_count
    })


# =========================================================
# ADD COMMENT
# =========================================================

@app.route("/add_comment", methods=["POST"])
def add_comment():

    data = request.get_json()

    post_id = data.get("post_id")
    username = data.get("username")
    comment = data.get("comment")


    if not post_id or not username or not comment:

        return jsonify({
            "success": False,
            "message": "Comment cannot be empty."
        })


    connection = get_db_connection()


    connection.execute("""
        INSERT INTO comments
        (post_id, username, comment)
        VALUES (?, ?, ?)
    """, (post_id, username, comment))


    connection.commit()


    comments = connection.execute("""
        SELECT *
        FROM comments
        WHERE post_id = ?
        ORDER BY id ASC
    """, (post_id,)).fetchall()


    connection.close()


    comment_list = []


    for item in comments:

        comment_list.append({
            "username": item["username"],
            "comment": item["comment"],
            "created_at": item["created_at"]
        })


    return jsonify({
        "success": True,
        "comments": comment_list
    })


# =========================================================
# GET COMMENTS
# =========================================================

@app.route("/get_comments/<int:post_id>")
def get_comments(post_id):

    connection = get_db_connection()


    comments = connection.execute("""
        SELECT *
        FROM comments
        WHERE post_id = ?
        ORDER BY id ASC
    """, (post_id,)).fetchall()


    connection.close()


    comment_list = []


    for item in comments:

        comment_list.append({
            "username": item["username"],
            "comment": item["comment"],
            "created_at": item["created_at"]
        })


    return jsonify({
        "success": True,
        "comments": comment_list
    })


# =========================================================
# ADMIN LOGIN PAGE
# =========================================================

@app.route("/admin")
def admin_login():
    return render_template("admin_login.html")


# =========================================================
# ADMIN DASHBOARD
# =========================================================

@app.route("/admin/dashboard")
def admin_dashboard():

    connection = get_db_connection()


    users = connection.execute("""
        SELECT *
        FROM users
        ORDER BY id DESC
    """).fetchall()


    posts = connection.execute("""
        SELECT *
        FROM posts
        ORDER BY id DESC
    """).fetchall()


    user_count = connection.execute("""
        SELECT COUNT(*) AS count
        FROM users
    """).fetchone()["count"]


    post_count = connection.execute("""
        SELECT COUNT(*) AS count
        FROM posts
    """).fetchone()["count"]


    connection.close()


    return render_template(
        "admin_dashboard.html",
        users=users,
        posts=posts,
        user_count=user_count,
        post_count=post_count
    )


# =========================================================
# ADMIN DELETE POST
# =========================================================

@app.route("/admin/delete_post/<int:post_id>", methods=["POST"])
def admin_delete_post(post_id):

    connection = get_db_connection()


    connection.execute("""
        DELETE FROM likes
        WHERE post_id = ?
    """, (post_id,))


    connection.execute("""
        DELETE FROM comments
        WHERE post_id = ?
    """, (post_id,))


    connection.execute("""
        DELETE FROM posts
        WHERE id = ?
    """, (post_id,))


    connection.commit()

    connection.close()


    return jsonify({
        "success": True,
        "message": "Post removed successfully."
    })


# =========================================================
# RUN APPLICATION
# =========================================================

if __name__ == "__main__":

    create_tables()

    app.run(debug=True)