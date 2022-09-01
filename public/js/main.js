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