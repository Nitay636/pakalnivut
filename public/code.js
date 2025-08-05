// -------------------- Time & Table Utilities --------------------

// Update the current time display
function updateCurrentTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  document.getElementById("current-time").textContent = `${hh}:${mm}:${ss}`;
}
setInterval(updateCurrentTime, 1000);
updateCurrentTime();

// Calculate time gap between current and arrival time (HH:MM)
function getTimeGap(current, arrival) {
  const [ch, cm] = current.split(":").map(Number);
  const [ah, am] = arrival.split(":").map(Number);
  let start = new Date();
  let end = new Date();
  start.setHours(ch, cm, 0, 0);
  end.setHours(ah, am, 0, 0);
  let diff = (end - start) / 60000;

  if (diff < 0) {
    console.log("Negative time gap");
    const hours = Math.abs(Math.floor(diff / 60) + 1);
    const mins = Math.abs(Math.round(diff % 60));
    return `${hours}:${mins.toString().padStart(2, "0")}-`;
  } else {
    const hours = Math.floor(diff / 60);
    const mins = Math.round(diff % 60);
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  }
}

// Get color class for time gap cell
function getTimeGapColor(gapStr) {
  const [h, m] = gapStr.split(":").map(Number);
  const totalMinutes = h * 60 + m;
  if (totalMinutes < 10) return "text-red-500 font-bold";
  if (totalMinutes < 30) return "text-orange-500 font-bold";
  if (isNaN(m)) {
    // Handle case where gap is negative or invalid
    return "text-red-800 font-bold";
  }
  return "text-green-600 font-bold";
}

// -------------------- Navigator & Table Logic --------------------

// Highlight the selected navigator toggle
function selectNavigator(n) {
  document.getElementById("navigator-select").value = n;
  ["navigator-btn-1", "navigator-btn-2"].forEach((id, idx) => {
    const btn = document.getElementById(id);
    if (btn) {
      const active = idx + 1 === Number(n);
      btn.classList.toggle("bg-blue-500", active);
      btn.classList.toggle("text-white", active);
      btn.classList.toggle("bg-white", !active);
      btn.classList.toggle("text-blue-500", !active);
    }
  });
}

// Check if required fields are filled
function missingData() {
  const distance = document.getElementById("distance").value.trim();
  const speed = document.getElementById("speed").value.trim();
  const userNumber = document.getElementById("user-number").value.trim();
  const userName = document.getElementById("user-name").value.trim();
  return (
    !distance ||
    isNaN(distance) ||
    distance <= 0 ||
    isNaN(speed) ||
    speed <= 0 ||
    !userNumber ||
    !userName
  );
}

// Save entry to localStorage table for selected navigator
function saveEntryToTable(entry, navigatorNum) {
  const tableKey = `savedTable_${navigatorNum}`;
  let table = JSON.parse(localStorage.getItem(tableKey) || "[]");
  table.push(entry);
  localStorage.setItem(tableKey, JSON.stringify(table));
}

// Clear all tables for both navigators
function clearTableData() {
  if (confirm("Are you sure you want to delete all saved entries?")) {
    localStorage.removeItem("savedTable_1");
    localStorage.removeItem("savedTable_2");
    alert("All entries deleted.");
  }
}

// -------------------- Table Rendering & Updating --------------------

// Render the table rows for the selected navigator
function renderTableRows(table, currentTime) {
  const tbody = document.getElementById("saved-table-body");
  tbody.innerHTML = "";

  if (table.length) {
    table.forEach((row) => {
      const gap = getTimeGap(currentTime, row.arrival);
      const gapColor = getTimeGapColor(gap);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border px-1 py-0.5">${row.number}</td>
        <td class="border px-1 py-0.5">${row.name}</td>
        <td class="border px-1 py-0.5">${row.distance}</td>
        <td class="border px-1 py-0.5">${row.speed}</td>
        <td class="border px-1 py-0.5">${row.delivering}</td>
        <td class="border px-1 py-0.5">${row.arrival}</td>
        <td class="border px-1 py-0.5 ${gapColor}">${gap}</td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="7" class="border px-1 py-0.5 text-center">לא השתלחו חוליות עדיין</td>`;
    tbody.appendChild(tr);
  }
}

// Update only the time gap column for all rows
function updateTableTimeGaps() {
  const navigatorNum = document.getElementById("navigator-select").value;
  const tableKey = `savedTable_${navigatorNum}`;
  const table = JSON.parse(localStorage.getItem(tableKey) || "[]");
  const tbody = document.getElementById("saved-table-body");
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  Array.from(tbody.children).forEach((tr, idx) => {
    if (table[idx]) {
      const arrival = table[idx].arrival;
      const gap = getTimeGap(currentTime, arrival);
      const td = tr.children[6];
      if (td) {
        td.textContent = gap;
        // td.className = `border px-1 py-0.5 ${getTimeGapColor(gap)}`;
      }
    }
  });
}

// Show the table modal and render/update time gaps
function openTableWindow() {
  const navigatorNum = document.getElementById("navigator-select").value;
  const tableKey = `savedTable_${navigatorNum}`;
  const table = JSON.parse(localStorage.getItem(tableKey) || "[]");
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
  renderTableRows(table, currentTime);
  document.getElementById("saved-table-container").classList.remove("hidden");
  updateTableTimeGaps();
}

// Update time gaps every 5 seconds when table is visible
setInterval(() => {
  const tableContainer = document.getElementById("saved-table-container");
  if (tableContainer && !tableContainer.classList.contains("hidden")) {
    updateTableTimeGaps();
  }
}, 5000);

// Close the table modal
function closeTableWindow() {
  document.getElementById("saved-table-container").classList.add("hidden");
}

// -------------------- Form & UI Logic --------------------

// Clear fields and reset result
function clearFields() {
  const input = document.getElementById("distance");
  input.value = "4.5";
  document.getElementById("result").textContent = "";
}

// Adjust distance input by delta
function adjustDistance(delta) {
  const input = document.getElementById("distance");
  let value = parseFloat(input.value);
  if (isNaN(value)) value = 5.0;
  value = Math.max(0, Math.round((value + delta) * 10) / 10);
  input.value = value.toFixed(1);
}

// Setup long press for plus/minus buttons
function setupLongPress(btnId, delta) {
  const btn = document.getElementById(btnId);
  let timer = null;
  let interval = null;
  let isLongPress = false;

  const start = (e) => {
    e.preventDefault();
    isLongPress = false;
    timer = setTimeout(() => {
      isLongPress = true;
      interval = setInterval(() => adjustDistance(delta), 80);
    }, 400);
  };

  const end = (e) => {
    clearTimeout(timer);
    clearInterval(interval);
    if (!isLongPress) adjustDistance(delta);
  };

  btn.addEventListener("mousedown", start);
  btn.addEventListener("mouseup", end);
  btn.addEventListener("mouseleave", end);
  btn.addEventListener("touchstart", start, { passive: false });
  btn.addEventListener("touchend", end);
  btn.addEventListener("touchcancel", end);
}
setupLongPress("minus-btn", -0.1);
setupLongPress("plus-btn", 0.1);

// Prevent double-tap to zoom on buttons (iOS)
let lastTouchEnd = 0;
document.addEventListener(
  "touchend",
  function (event) {
    if (event.target.tagName === "BUTTON") {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) event.preventDefault();
      lastTouchEnd = now;
    }
  },
  false
);

// Enable editing on distance input via long press
(function setupDistanceLongPress() {
  const input = document.getElementById("distance");
  let timer = null;

  const start = (e) => {
    e.preventDefault();
    timer = setTimeout(() => {
      input.readOnly = false;
      input.focus();
      input.select();
    }, 400);
  };

  const end = () => {
    clearTimeout(timer);
  };

  input.addEventListener("mousedown", start);
  input.addEventListener("mouseup", end);
  input.addEventListener("mouseleave", end);
  input.addEventListener("touchstart", start, { passive: false });
  input.addEventListener("touchend", end);
  input.addEventListener("touchcancel", end);

  input.addEventListener("blur", () => {
    input.readOnly = true;
  });
})();

// -------------------- Summary Bubble Logic --------------------

// Show summary bubble after calculation
function showSummaryBubble(
  userNumber,
  userName,
  distance,
  delivering,
  arrival
) {
  document.getElementById(
    "summary-number"
  ).textContent = `חוליה: ${userNumber}`;
  document.getElementById("summary-name").textContent = `שם: ${userName}`;
  document.getElementById(
    "summary-time"
  ).textContent = `אורך ציר: ${distance} ק״מ`;
  document.getElementById(
    "summary-arrival"
  ).textContent = `ש. שילוח: ${delivering}`;
  document.getElementById(
    "summary-distance"
  ).textContent = `ש. משימה: ${arrival}`;
  const bubble = document.getElementById("summary-bubble");
  bubble.classList.remove("hidden");
  bubble.classList.remove("bubble-animate-out");
  bubble.classList.add("bubble-animate-in");
}

// Close summary bubble
const bubble = document.getElementById("summary-bubble");
document.getElementById("close-summary").addEventListener("click", () => {
  bubble.classList.remove("bubble-animate-in");
  bubble.classList.add("bubble-animate-out");
  setTimeout(() => bubble.classList.add("hidden"), 200);
});
bubble.addEventListener("click", (e) => {
  if (e.target === bubble) {
    bubble.classList.remove("bubble-animate-in");
    bubble.classList.add("bubble-animate-out");
    setTimeout(() => bubble.classList.add("hidden"), 200);
  }
});

// -------------------- Main Calculation Logic --------------------

// Main calculate function
function calculateTime() {
  if (missingData()) {
    alert("יש למלא את כל הפרטים של המנווט");
    return;
  }
  const navigatorNum = document.getElementById("navigator-select").value;
  const userNumber = document.getElementById("user-number").value.trim();
  const userName = document.getElementById("user-name").value.trim();
  const distance = parseFloat(document.getElementById("distance").value);
  const speed = parseFloat(document.getElementById("speed").value) || 2.5;
  let extraTime = 0;
  if (document.getElementById("add-time-checkbox").checked) {
    extraTime = parseInt(document.getElementById("extra-minutes").value) || 0;
  }
  const now = new Date();
  const hoursNeeded = distance / speed;
  const arrivalDate = new Date(
    now.getTime() + hoursNeeded * 60 * 60 * 1000 + extraTime * 60000
  );
  const arrival = `${String(arrivalDate.getHours()).padStart(2, "0")}:${String(
    arrivalDate.getMinutes()
  ).padStart(2, "0")}`;
  const delivering = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
  const timeGap = getTimeGap(delivering, arrival);

  // Save to table for selected navigator
  saveEntryToTable(
    {
      navigatorNum,
      number: userNumber,
      name: userName,
      distance,
      speed,
      extraTime,
      delivering,
      arrival,
      timeGap,
    },
    navigatorNum
  );

  // Show summary bubble
  showSummaryBubble(userNumber, userName, delivering, distance, arrival);
}

// -------------------- Initial Setup --------------------

// Set initial values for fields
document.getElementById("user-name").value = "";
document.getElementById("user-number").value = "1";
document.getElementById("distance").value = "4.5";

// Show navigator buttons if there is data
["1", "2"].forEach((n) => {
  const tableKey = `savedTable_${n}`;
  const table = JSON.parse(localStorage.getItem(tableKey) || "[]");
  if (table.length > 0) {
    document.getElementById(`navigator-btn-${n}`).classList.remove("hidden");
  }
});

// Add event listeners for navigator buttons
document.querySelectorAll("[id^='navigator-btn-']").forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    selectNavigator(idx + 1);
  });
});

// Select first navigator by default
selectNavigator(1);
