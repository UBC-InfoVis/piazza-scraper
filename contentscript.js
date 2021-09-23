
// Wait for user requests
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    // Get all the students who posted something
    let posted = $('.main_followup > * > .discussion_poster').map(function() {
      return $(this).text();
    }).get();

    // Get all the students who contributed to follow-up discussions
    let responded = $('.discussion_replies .discussion_poster').map(function() {
      return $(this).text();
    }).get();

    if (request.code == "SCRAPE_NAMES") {
      sendResponse({ "student_names": { "posted": posted, "responded": responded } });
    }
    return true;
});
