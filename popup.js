// Global list to track the number of student posts and responses
let students = {};

let btnScrape = document.getElementById('btn-scrape');
let btnExport = document.getElementById('btn-export');
let btnReset = document.getElementById('btn-reset');

// Initialize jQuery table sort
$('#students').tablesorter();


/*
 * Check if student list exists and update UI
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get student list and restore in DOM
  getStudentList();
});


/*
 * Update student list after scraping single page
 */
function addStudents(newStudents, category) {
  newStudents.forEach(d => {
    if (!students.hasOwnProperty(d)) {
      students[d] = { "name": d, "posted": 0, "responded": 0 };
    }
    students[d][category]++;
  });
}


/*
 * Update extension popup to show preview of student list
 */
function updateStudentTable() {
  if (Object.keys(students).length > 0) {
    $('#students').fadeIn();
    $('#msg-no-students').fadeOut();
  } else {
    $('#students').fadeOut();
    $('#msg-no-students').fadeIn();
  }

  // Clear table and repopulate
  $('#students tbody').empty();
  for (var key in students) {
    $('#students > tbody:last-child').append(`<tr>
                                                <td>${students[key]["name"]}</td>
                                                <td>${students[key]["posted"]}</td>
                                                <td>${students[key]["responded"]}</td>
                                              </tr>`);
  }
}


/*
 * Call contentscript.js to extract student names from current Piazza page 
 */
btnScrape.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { code: "SCRAPE_NAMES" }, function(response) {
      if (response.student_names) {
        addStudents(response.student_names.posted, "posted");
        addStudents(response.student_names.responded, "responded");
        updateStudentTable();
        saveStudentList();
      }
    });
  });
}


/*
 * Reset student list in local storage and DOM
 */
btnReset.onclick = function(element) {
  students = {};
  chrome.storage.local.remove("students");
  updateStudentTable();
}


/*
 * Export student list as .CSV file
 */
btnExport.onclick = function(element) {
  // Convert into flat array
  let studentsArr = [];
  for (var key in students) {
    studentsArr.push(students[key]);
  }

  // CSV header
  let csvContent = Object.keys(studentsArr[0]).join(',') + '\n';
  
  // 1 student = 1 row
  csvContent += studentsArr.map(row => Object.values(row).join(',')).join("\n");
  let csvBlob = new Blob([csvContent], { type: 'text/csv' });
  let csvUrl = URL.createObjectURL(csvBlob);
  chrome.downloads.download({ url: csvUrl, filename: 'piazza_participation.csv' });
}


/*
 * Get and set local storage
 */

function saveStudentList() {
  chrome.storage.local.set({ "students": students });
}

function getStudentList() {
  chrome.storage.local.get(["students"], function(result) {
    if (typeof result.students !== 'undefined') {
      students = result.students;
      updateStudentTable();
    }
  });
}
