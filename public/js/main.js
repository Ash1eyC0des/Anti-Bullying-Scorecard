// @desc Search / Autocomplete functionality (jQuery UI)
$(document).ready(function() {
  $("#school").autocomplete({
    source: async function(req, res) {
      let data = await fetch(`http://localhost:8000/autocomplete?term=${req.term}`) 
        .then(results => results.json())
        .then(results => results.map(result => {
          return { label: result.school_name, value: result.school_name, id: result._id }
        }))
      res(data)
      },
      minLength: 2,
      select: function(event, ui) {
        $(location).attr('href',`http://localhost:8000/schools/${ui.item.id}`);
        // fetch(`http://localhost:8000/schools/${ui.item.id}`)
        // 	.then(school => school.json())
        // .then(school => console.log(school))
      }
    })
  })


// @desc Delete & Edit button functionality
const deleteBtn = document.querySelectorAll('.btn_delete')
// const editBtn = document.querySelectorAll('.btn_edit')

Array.from(deleteBtn).forEach((btn => {
  btn.addEventListener('click', deleteScorecard)
}))

// Array.from(editBtn).forEach((btn => {
//   btn.addEventListener('click', editScorecard)
// }))

async function deleteScorecard() {
  const scorecardId = this.dataset.id
  try {
    const response = await fetch('/scorecards/delete', {
      method: 'DELETE', 
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({
        'scorecardId': scorecardId
      })
    })
    const data = await response.json()
    console.log(data)
    location.reload()
  } catch(err){
    console.log(err)
  }
}

// async function editScorecard() {
//   const scorecardId = this.dataset.id
//   try {
//     const response = await fetch(`/scorecards/${scorecardId}/edit`, {
//       headers: {'Content-type': 'application/json'},
//       body: JSON.stringify({
//         'scorecardId': scorecardId
//       })
//     })
//     const data = await response.json()
//     console.log(data)
//     location.reload()
//   } catch(err){
//     console.log(err)
//   }
// }


// @desc Useful & Not Useful button functionality
const usefulBtn = document.querySelectorAll('.btn_useful')
const notUsefulBtn = document.querySelectorAll('.btn_not_useful')

Array.from(usefulBtn).forEach((btn => {
  btn.addEventListener('click', markUseful)
}))

Array.from(notUsefulBtn).forEach((btn => {
  btn.addEventListener('click', markNotUseful)
}))

async function markUseful() {
  const scorecardId = this.dataset.id
  let upvotes = +this.dataset.upvotes
  let downvotes = +this.nextElementSibling.dataset.downvotes

  if (this.classList.contains('green')) {
    this.classList.remove('green')
    upvotes -= 1
    this.setAttribute('data-upvotes', upvotes)
  } else if (!this.classList.contains('green')) {
    if (this.nextElementSibling.classList.contains('red')) {
      this.nextElementSibling.classList.remove('red')
      downvotes -= 1
      this.nextElementSibling.setAttribute('data-downvotes', downvotes)
    }   
    upvotes += 1
    this.setAttribute('data-upvotes', upvotes)
    this.classList.toggle('green')
  }

  try {
    const response = await fetch('/scorecards/markUseful', {
      method: 'PUT', 
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({
        'scorecardId': scorecardId, 
        'upvotes': upvotes, 
        'downvotes': downvotes
      })
    })
  } catch(err){
    console.log(err)
  }
}

async function markNotUseful() {
  const scorecardId = this.dataset.id
  let upvotes = +this.previousElementSibling.dataset.upvotes
  let downvotes = +this.dataset.downvotes

  if (this.classList.contains('red')) {
    this.classList.remove('red')
    downvotes -= 1
    this.setAttribute('data-downvotes', downvotes)
  } else if (!this.classList.contains('red')) {
    if (this.previousElementSibling.classList.contains('green')) {
      this.previousElementSibling.classList.remove('green')
      upvotes -= 1
      this.previousElementSibling.setAttribute('data-upvotes', upvotes)
    }   
    downvotes += 1
    this.setAttribute('data-downvotes', downvotes)
    this.classList.toggle('red')
  }

  try {
    const response = await fetch('/scorecards/markNotUseful', {
      method: 'PUT', 
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({
        'scorecardId': scorecardId,
        'upvotes': upvotes, 
        'downvotes': downvotes
      })
    })
  } catch(err){
    console.log(err)
  }
}

// @desc Delete User
const deleteUserBtn = document.getElementById('delete_user_btn')
deleteUserBtn.addEventListener('click', deleteUser)

async function deleteUser() {
  try {
    await fetch('/user/delete', {
      method: 'DELETE', 
      headers: {'Content-type': 'application/json'},
    })
  } catch(err){
    console.log(err)
  }

}


// // @desc Pagination
// const paginationNumbers = document.getElementById("pagination-numbers");
// const paginatedList = document.getElementById("paginated-list");
// const listItems = paginatedList.querySelectorAll(".review_card");
// const nextButton = document.getElementById("next-button");
// const prevButton = document.getElementById("prev-button");

// const paginationLimit = 10;
// const pageCount = Math.ceil(listItems.length / paginationLimit);
// let currentPage;

// const appendPageNumber = (index) => {
//   const pageNumber = document.createElement("button");
//   pageNumber.className = "pagination-number";
//   pageNumber.innerHTML = index;
//   pageNumber.setAttribute("page-index", index);
//   pageNumber.setAttribute("aria-label", "Page " + index);
 
//   paginationNumbers.appendChild(pageNumber);
// };
 
// const getPaginationNumbers = () => {
//   for (let i = 1; i <= pageCount; i++) {
//     appendPageNumber(i);
//   }
// };