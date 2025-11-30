


const cl = console.log

const postContainer = document.getElementById("postContainer")
const blogForm = document.getElementById("blogForm")
const titleCntrl = document.getElementById("title")
const contentCntrl = document.getElementById("content")
const userIdCntrl = document.getElementById("userId")
const addPostBtn = document.getElementById("addPostBtn")
const updatePostBtn = document.getElementById("updatePostBtn")
const loader = document.getElementById("loader")

let BASE_URL = `https://blog-task-43dea-default-rtdb.firebaseio.com`
let POST_URL = `${BASE_URL}/blogs.json`

function toggleSpinner(flag) {
    if (flag === true) {
        loader.classList.remove('d-none')
    } else {
        loader.classList.add('d-none')
    }
}

function snackBar(title, icon) {
    Swal.fire({
        title,
        icon,
        timer: 1000
    })
}

const createCards = arr => {
    let res = arr.map(post => {
        return `
        <div class="card mb-3 shadow rounded" id="${post.id}">
                    <div class="card-header">
                        <h3 class="m-0">${post.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">
                        ${post.content}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="onRemove(this)">Remove</button>
                    </div>
                </div> `;
    }).join("")
    cl(res)
    postContainer.innerHTML = res;
}

function blogObjToArr(obj) {
    let blogsArr = []
    for (const key in obj) {
        obj[key].id = key
        blogsArr.push(obj[key])
    }
    return blogsArr
}


function makeApiCall(apiUrl, methodName, msgBody) {
    msgBody = msgBody ? JSON.stringify(msgBody) : null
    toggleSpinner(true)
    return fetch(apiUrl, {
        method: methodName,
        body: msgBody,
        headers: {
            Auth: "Tokens From LS ",
            "Content-Type": "application/json"
        }
    })
        .then(res => {
            return res.json()
                .then(data => {
                    if (!res.ok) {
                        throw new Error(res.status || "Network Error")
                    }
                    return data
                })

        })
        .finally(() => {
            toggleSpinner(false)
        })
}

function fetchAllBlogs() {
    makeApiCall(POST_URL, "GET", null)
        .then(data => {
            let blogsArr = blogObjToArr(data)
            createCards(blogsArr)
        })
        .catch(err => snackBar(err, "error"))
}
fetchAllBlogs()

function onBlogAdd(eve) {
    eve.preventDefault();
    let blogObj = {
        title: titleCntrl.value,
        content: contentCntrl.value,
        userId: userIdCntrl.value
    }

    makeApiCall(POST_URL, "POST", blogObj)
        .then(data => {
            let card = document.createElement("div");
            card.className = "card mb-3 shadow rounded";
            card.innerHTML = `
        <div class="card-header">
                        <h3 class="m-0">${blogObj.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">
                        ${blogObj.content}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="onRemove(this)">Remove</button>
                    </div>
        
        `;
            postContainer.append(card)
            blogForm.reset()
            snackBar(`blog created successfully!!!`, "success")
        })
        .catch(err => {
            snackBar(`somrthing went wrong while creating blog!!!`, "error")
        })
}


function onRemove(ele) {
    Swal.fire({
        title: "Do you want to Remove?",
        showCancelButton: true,
        confirmButtonText: "Remove",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33"
    }).then((result) => {
        if (result.isConfirmed) {
            let REMOVE_ID = ele.closest(".card").id
            cl(REMOVE_ID);
            let REMOVE_URL = `${BASE_URL}/blogs/${REMOVE_ID}.json`;
            cl(REMOVE_URL);

            makeApiCall(REMOVE_URL, "DELETE", null)
                .then(data => {
                    cl(data)
                    ele.closest(".card").remove();
                    snackBar(`Blog removed successfully!!`, "success")
                })
                .catch(err => {
                    snackBar(`Something went while removing blog!!!`, "error")
                })
        }
    });
}


function onEdit(ele) {
    let EDIT_ID = ele.closest(".card").id;
    cl(EDIT_ID)
    localStorage.setItem("EDIT_ID", EDIT_ID);
    let EDIT_URL = `${BASE_URL}/blogs/${EDIT_ID}.json`;
    cl(EDIT_URL)

    blogForm.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
        titleCntrl.focus();
    }, 500)

    makeApiCall(EDIT_URL, "GET", null)
        .then(data => {
            titleCntrl.value = data.title,
                contentCntrl.value = data.content,
                userIdCntrl.value = data.userId

            updatePostBtn.classList.remove("d-none");
            addPostBtn.classList.add("d-none");
        })
        .catch(err => snackBar(err, "error"))

}

function onUpdate() {
    let UPDATE_ID = localStorage.getItem("EDIT_ID");
    cl(UPDATE_ID);

    let UPDATE_URL = `${BASE_URL}/blogs/${UPDATE_ID}.json`;
    cl(UPDATE_URL);

    const UPDATE_OBJ = {
        title: titleCntrl.value,
        content: contentCntrl.value,
        userId: userIdCntrl.value
    }
    cl(UPDATE_OBJ);

    makeApiCall(UPDATE_URL, "PATCH", UPDATE_OBJ)
        .then(data => {
            const card = document.getElementById(UPDATE_ID)
            card.querySelector(".card-header h3").innerHTML = data.title;
            card.querySelector(".card-body p").innerHTML = data.content;

            card.scrollIntoView({ behavior: "smooth", block: "center" });
            card.classList.add("border", "border-success")
            setTimeout(() => {
                card.classList.remove("border", "border-success")
            }, 500)

            blogForm.reset()

            updatePostBtn.classList.add("d-none");
            addPostBtn.classList.remove("d-none");
           
            snackBar(`Blog updated successfully!!`, "success")
        })
        .catch(err => {
            snackBar(`omething went wrong while updating blog!!`, "error")
        })

}

updatePostBtn.addEventListener("click", onUpdate);
blogForm.addEventListener("submit", onBlogAdd)

