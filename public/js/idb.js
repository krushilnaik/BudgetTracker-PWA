let db;

const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = function (event) {
	const db = event.target.result;

	db.createObjectStore("budget_tracker", { autoIncrement: true });
};

request.onsuccess = function (event) {
	db = event.target.result;

	if (navigator.onLine) {
		uploadBudget();
	}
};

request.onerror = function (event) {
	console.error("Error: " + event.target.errorCode);
};

function saveRecord(record) {
	const transaction = db.transaction(["budget_tracker"], "readwrite");
	const store = transaction.objectStore("budget_tracker");

	store.add(record);
}

function uploadBudget() {
	const transaction = db.transaction(["budget_tracker"], "readwrite");
	const store = transaction.objectStore("budget_tracker");
	const getAll = store.getAll();

	getAll.onsuccess = function () {
		if (getAll.result.length > 0) {
			fetch("/api/transaction/bulk", {
				method: "POST",
				body: JSON.stringify(getAll.result),
				headers: {
					Accept: "application/json, text/plain, */*",
					"Content-Type": "application/json"
				}
			})
				.then((response) => response.json())
				.then(() => {
					const transaction = db.transaction(["budget_tracker"], "readwrite");
					const store = transaction.objectStore("budget_tracker");
					store.clear();
				});
		}
	};
}

function deletePending() {
	const transaction = db.transaction(["budget_tracker"], "readwrite");
	const store = transaction.objectStore("budget_tracker");
	store.clear();
}

window.addEventListener("online", uploadBudget);
