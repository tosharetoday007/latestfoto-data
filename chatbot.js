// ============================================================
//  Chatbot data loader — replaces 196 KB of hardcoded arrays
//  Host tours.json, toursV2.json, accommodations.json on GitHub
//  then update the BASE_URL below to your raw GitHub URL.
// ============================================================

(function () {

  // ▼▼▼ CHANGE THIS to your raw GitHub URL (see instructions) ▼▼▼
  const BASE_URL = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/data/';
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  let toursData         = null;
  let toursDataV2       = null;
  let accommodationsData = null;

  // Load all three JSON files in parallel
  Promise.all([
    fetch(BASE_URL + 'tours.json').then(r => r.json()),
    fetch(BASE_URL + 'toursV2.json').then(r => r.json()),
    fetch(BASE_URL + 'accommodations.json').then(r => r.json()),
  ]).then(([t1, t2, acc]) => {
    toursData          = t1;
    toursDataV2        = t2;
    accommodationsData = acc;
  }).catch(err => {
    console.error('Chatbot data failed to load:', err);
  });

  // Wire up send button after DOM is ready
  document.addEventListener('DOMContentLoaded', function () {

    const sendBtn = document.getElementById('send-btn');
    if (!sendBtn) return;

    sendBtn.addEventListener('click', function () {
      const userInput = document.getElementById('user-input').value.trim();
      if (userInput === '') return;

      // Store the query
      const storedQueries = JSON.parse(localStorage.getItem('searchQueries')) || [];
      storedQueries.push(userInput);
      localStorage.setItem('searchQueries', JSON.stringify(storedQueries));

      appendMessage('You', userInput);
      document.getElementById('user-input').value = '';

      const normalizedInput = userInput.toLowerCase();

      if (!Array.isArray(toursData) || !Array.isArray(toursDataV2) || !Array.isArray(accommodationsData)) {
        appendMessage('Answer', 'Data is still loading, please try again in a moment.');
        return;
      }

      let resultsList = '';
      const allTours = [...toursData, ...toursDataV2];

      // Find matching tours
      const matchingTours = allTours.filter(tour =>
        normalizedInput.split(' ').some(word =>
          (tour.city && tour.city.toLowerCase().includes(word)) ||
          (tour.City && tour.City.toLowerCase().includes(word)) ||
          (tour.Country && tour.Country.toLowerCase().includes(word)) ||
          (tour['Tour Title'] && tour['Tour Title'].toLowerCase().includes(word)) ||
          (tour.tours && tour.tours.some(t =>
            t.name.toLowerCase().includes(word) || t.description.toLowerCase().includes(word)
          ))
        )
      );

      // Find matching accommodations
      const matchingAccommodation = accommodationsData.filter(accommodation =>
        normalizedInput.split(' ').some(word =>
          (accommodation.city && accommodation.city.toLowerCase().includes(word)) ||
          (accommodation.Country && accommodation.Country.toLowerCase().includes(word))
        )
      );

      // Process tour results
      if (matchingTours.length > 0) {
        matchingTours.forEach(tourData => {
          if (tourData.tours && tourData.tours.length > 0) {
            const toursList = tourData.tours.map(tourItem =>
              `<strong>${tourItem.name}:</strong> ${tourItem.description} - <strong>${tourItem.price}</strong> <a href="${tourItem.url}" target="_blank">More Info</a>`
            ).join('<br>');
            resultsList += `<strong>Tours available in ${tourData.city}:</strong><br>${toursList}<br><br>`;
          } else if (tourData['Tour Title']) {
            resultsList += `<strong>${tourData['Tour Title']}:</strong> ${tourData['AVG Rating']} ⭐ (${tourData['Reviews']} reviews) - <strong>${tourData['Price from']}€</strong> <a href="${tourData['Activity URL']}" target="_blank">More Info</a><br><br>`;
          }
        });
      }

      // Process accommodation results
      if (matchingAccommodation.length > 0) {
        matchingAccommodation.forEach(accommodation => {
          if (Array.isArray(accommodation.Hostel) && accommodation.Hostel.length > 0) {
            const accommodationList = accommodation.Hostel.map(hostelItem =>
              `<strong>${hostelItem.name}:</strong> ${hostelItem.description} - <strong>${hostelItem.price}</strong> <a href="${hostelItem.url}" target="_blank">More Info</a>`
            ).join('<br>');
            resultsList += `<strong>Accommodations available in ${accommodation.city}:</strong><br>${accommodationList}<br><br>`;
          } else {
            resultsList += `<strong>${accommodation.Hostel}:</strong> ${accommodation.Description} - <strong>${accommodation.Price}€</strong> <a href="${accommodation.URL}" target="_blank">More Info</a><br><br>`;
          }
        });
      }

      // Display response
      if (resultsList === '') {
        appendMessage('Answer',
          'Sorry, No Answer.<br><br>' +
          '<strong>Explore More:</strong><br>' +
          '<a href="https://www.latestfoto.com/" target="_blank">Miscellaneous Issues</a><br>' +
          '<a href="https://www.immigrationopportunity.com/" target="_blank">Explore Current Immigration Opportunities</a><br>' +
          '<a href="https://www.freetraveltours.com/" target="_blank">Free Travel and Tours</a><br>' +
          '<a href="https://www.hichicas.com/" target="_blank">Check out</a><br>' +
          '<a href="https://shopinsolution.blogspot.com/" target="_blank">Shop now</a><br>' +
          '<a href="https://aprenderelhindi.blogspot.com/" target="_blank">Learn Language (English, Spanish, Hindi, French)</a><br><br>' +
          '<strong>Follow Us!</strong><br>' +
          '<a href="https://www.twitter.com/tosharetoday" target="_blank">Twitter</a><br>' +
          '<a href="https://www.facebook.com/tosharetoday" target="_blank">Facebook</a><br><br>' +
          '<strong>Our YouTube Channels!</strong><br>' +
          '<a href="https://www.youtube.com/MrLatesttravel" target="_blank">Travel</a><br>' +
          '<a href="https://www.youtube.com/user/latestfood" target="_blank">Non-Expert Recipes</a><br>' +
          '<a href="https://www.youtube.com/latestfotocom" target="_blank">Gossip</a><br>'
        );
      } else {
        appendMessage('Answer', resultsList);
      }
    });
  });

  function appendMessage(sender, message) {
    const chatbox = document.getElementById('chatbox');
    if (!chatbox) return;
    const messageElem = document.createElement('div');
    messageElem.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatbox.appendChild(messageElem);
    chatbox.scrollTop = chatbox.scrollHeight;

    // AdSense ad after each message
    const adContainer = document.createElement('div');
    adContainer.innerHTML = `
      <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-4039151306597903"
        data-ad-slot="2866365749"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>`;
    chatbox.appendChild(adContainer);
    (adsbygoogle = window.adsbygoogle || []).push({});
  }

})();
