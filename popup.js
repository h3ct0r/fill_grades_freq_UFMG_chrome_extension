/**
 * Parse CSV text into a Map keyed by the "MATRICULA" column and return the parsed headers.
 *
 * Uses Papa.parse with { header: true, skipEmptyLines: true } internally.
 * Any parser errors are logged to the console. The "MATRICULA" field is removed
 * from each row object and used as the Map key.
 *
 * @param {string} csvText - The CSV document as a string.
 * @returns {{ data: Map<string, Object>, headers: string[]|undefined }}
 *   An object containing:
 *     - data: Map where each key is a MATRICULA value (string) and each value is
 *             a row object mapping column names to cell values (MATRICULA removed).
 *     - headers: Array of header names in original order, or undefined if headers
 *                could not be determined.
 */
function parseCSV(csvText) {
    var headersCSV = undefined;

    var csvData = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            headersCSV = results.meta.fields;

            if (results.errors.length > 0) {
                console.log("Parsing errors:", results.errors);
            }

            if (headersCSV.length <= 0) {
                console.log("CSV headers empty");
            }
        }
    });

    const dataMap = csvData.data.reduce((mapAccum, row) => {
        var matricula = row.MATRICULA;
        delete row.MATRICULA;

        mapAccum.set(matricula, row);
        return mapAccum;
    }, new Map());

    console.log("dataMap:", dataMap);
    console.log("headers:", headersCSV);

    return {
        "data": dataMap,
        "headers": headersCSV
    };
}

/**
 * Updates the page status element with a message and visual type.
 *
 * Selects the element with id "status", sets its textContent to the provided message,
 * assigns its className to the provided type (expected 'success' or 'error'),
 * and makes the element visible by setting its display style to 'block'.
 *
 * @param {string} msg - The message to display in the status element.
 * @param {'success'|'error'} type - The visual type to apply as a CSS class.
 * @returns {void}
 */
function showStatus(msg, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = msg;
    statusDiv.className = type; // 'success' or 'error'
    statusDiv.style.display = 'block';
}

/**
 * Determine whether two sets contain the same elements.
 *
 * Compares sizes and ensures every element of the first set is present in the second.
 * Element comparison uses the semantics of Set.prototype.has (SameValueZero).
 *
 * @template T
 * @param {Set<T>} a - First set.
 * @param {Set<T>} b - Second set.
 * @returns {boolean} True if both sets contain the same elements (order-independent).
 */
const areSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));

document.addEventListener('DOMContentLoaded', async () => {

    // grades steps by default
    var parentStep1 = document.getElementById('grades-step-1');
    var parentStep2 = document.getElementById('grades-step-2');
    var parentStep3 = document.getElementById('grades-step-3');
    var parsedData = undefined;
    var parsedHeaders = undefined;
    var headersAV = undefined;

    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    // check if the user is in the right page
    if (!tab.url.includes("localhost") &&
        !tab.url.includes("sistemas.ufmg.br/diario/frequenciaTurma/frequencia/solicitar/solicitarFrequencia.do") &&
        !tab.url.includes("sistemas.ufmg.br/diario/notaTurma/notaAvaliacao/solicitar/solicitarNota.do?acao=lancarAvaliacaoCompleta") &&
        !tab.url.includes("homepages.dcc.ufmg.br/~hector.azpurua/notas_mock/")) {

        document.getElementById('interface-grades').style.display = 'none';
        document.getElementById('interface-frequency').style.display = 'none';
        document.getElementById('invalid-url-msg').style.display = 'block';
    } else {
        if (tab.url.includes("sistemas.ufmg.br/diario/frequenciaTurma/frequencia/solicitar/solicitarFrequencia.do")) {
            // steps
            parentStep1 = document.getElementById('frequency-step-1');
            parentStep2 = document.getElementById('frequency-step-2');
            parentStep3 = document.getElementById('frequency-step-3');

            // check for valid frequency ids and data
            chrome.tabs.sendMessage(
                tab.id, {
                action: "check_if_in_total_freq_page"
            }, (response) => {
                if (chrome.runtime.lastError) {
                    // Handle connection errors (e.g., content script not loaded)
                    document.getElementById('invalid-url-msg').style.display = 'block';
                    showStatus("Error: Refresh the page and try again.", "error");
                    return;
                }

                document.getElementById('interface-frequency').style.display = 'block';

                var headersFreqFound = document.getElementById('headersFreqFound');
                headersFreqFound.classList.remove("red-color");
                headersFreqFound.classList.add("green-color");
                document.getElementById('headersFreqFound').innerHTML = 'FREQ';

                const step_status = parentStep1.querySelector('.step-status');
                step_status.innerHTML = "&#9989;";

                parentStep2.style.display = "block";
            });
        }
        else {
            document.getElementById('interface-grades').style.display = 'block';
            // check for valid AV headers
            chrome.tabs.sendMessage(
                tab.id, {
                action: "get_av_headers"
            }, (response) => {
                if (chrome.runtime.lastError) {
                    // Handle connection errors (e.g., content script not loaded)
                    showStatus("Error: Refresh the page and try again.", "error");
                    return;
                }
                const headersAVFoundDiv = document.getElementById('headersAVFound');
                const step_status = parentStep1.querySelector('.step-status');
                if (response && response.status === "success") {
                    headersAV = response.message;
                    headersAVFoundDiv.classList.remove("red-color");
                    headersAVFoundDiv.classList.add("green-color");
                    headersAVFoundDiv.innerHTML = headersAV;
                    step_status.innerHTML = "&#9989;";
                    parentStep2.style.display = "block";
                } else {
                    showStatus(`Error: ${response.message}`, "error");
                    headersAVFoundDiv.classList.add("red-color");
                    headersAVFoundDiv.classList.remove("green-color");
                    headersAVFoundDiv.innerHTML = "None";
                    step_status.innerHTML = "&#10060;";
                    parentStep2.style.display = "none";
                    parentStep3.style.display = "none";
                }
            });
        }
    }

    const csvInput = document.getElementById('csvInput');
    csvInput.addEventListener('change', () => {
        const file = csvInput.files[0];
        if (!file) {
            showStatus("Please select a CSV file first.", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            try {
                var parseResult = parseCSV(text);
                parsedData = parseResult["data"];
                parsedHeaders = parseResult["headers"];

                const step_status = parentStep2.querySelector('.step-status');
                var csvHeaderOkDiv = document.getElementById('csvHeadersOK');
                var csvElemDescDiv = document.getElementById('csvElementsDesc');

                if (!parsedData || parsedData.size === 0 || parsedHeaders.length <= 0) {
                    parsedData = undefined;
                    csvHeaderOkDiv.innerHTML = "-";
                    csvHeaderOkDiv.classList.add("red-color");
                    csvHeaderOkDiv.classList.remove("green-color");
                    csvElemDescDiv.innerHTML = 0;
                    csvElemDescDiv.classList.add("red-color");
                    csvElemDescDiv.classList.remove("green-color");
                    throw new Error("CSV is empty or could not be parsed.");
                }

                csvHeaderOkDiv.innerHTML = parsedHeaders.join(", ");
                if (!parsedHeaders.includes("MATRICULA")) {
                    parentStep3.style.display = "none";

                    csvHeaderOkDiv.classList.add("red-color");
                    csvHeaderOkDiv.classList.remove("green-color");

                    csvElemDescDiv.innerHTML = 0;
                    csvElemDescDiv.classList.add("red-color");
                    csvElemDescDiv.classList.remove("green-color");

                    step_status.innerHTML = "&#10060;";
                    throw new Error("CSV does not contain's `MATRICULA`.");
                }

                // CSV headers without MATRICULA
                const avHeaderSet = new Set(headersAV.split(', '));
                const parsedHeaderSet = new Set(parsedHeaders.filter(item => !(item == "MATRICULA")));
                if (!areSetsEqual(avHeaderSet, parsedHeaderSet)) {
                    parentStep3.style.display = "none";
                    csvHeaderOkDiv.classList.add("red-color");
                    csvHeaderOkDiv.classList.remove("green-color");

                    csvElemDescDiv.innerHTML = 0;
                    csvElemDescDiv.classList.add("red-color");
                    csvElemDescDiv.classList.remove("green-color");

                    step_status.innerHTML = "&#10060;";
                    throw new Error("The uploaded CSV does NOT have the same columns as the AV header in the webpage.");
                } else {
                    csvHeaderOkDiv.classList.add("green-color");
                    csvHeaderOkDiv.classList.remove("red-color");
                }

                csvElemDescDiv.innerHTML = parsedData.size;
                if (parsedData.size <= 0) {
                    parentStep3.style.display = "none";
                    csvElemDescDiv.classList.add("red-color");
                    csvElemDescDiv.classList.remove("green-color");
                    step_status.innerHTML = "&#10060;";
                    throw new Error("CSV content is empty.");
                } else {
                    csvElemDescDiv.classList.add("green-color");
                    csvElemDescDiv.classList.remove("red-color");
                    step_status.innerHTML = "&#9989;";
                }

                // ready for final step
                parentStep3.style.display = "block";
                showStatus("CSV data ready to fill the form!", "success");
            } catch (err) {
                showStatus(err.message, "error");
            }
        };

        reader.onerror =
            function () {
                showStatus("Failed to parse CSV file.", "error");
            };

        reader.readAsText(file);
    });

    const fillGradesBtn = document.getElementById('fillGradesBtn');
    fillGradesBtn.addEventListener('click', () => {
        if (!parsedData) {
            showStatus("There is no available parsed CSV data for filling the form.", "error");
            return;
        }

        chrome.tabs.sendMessage(
            tab.id, {
            action: "fill_grade_form",
            data: Object.fromEntries(parsedData.entries())
        }, (response) => {
            // Handle connection errors (e.g., content script not loaded)
            if (chrome.runtime.lastError) {
                showStatus("Error: Refresh the page and try again.", "error");
                return;
            }

            if (response && response.status === "success") {
                showStatus(`Success! ${response.message}.`, "success");
            } else {
                showStatus(`Error: ${response.message}`, "error");
            }
        });
    });

    const freqCsvInput = document.getElementById('freqCsvInput');
    freqCsvInput.addEventListener('change', () => {
        const file = freqCsvInput.files[0];
        if (!file) {
            showStatus("Please select a CSV file first.", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            try {
                var parseResult = parseCSV(text);
                parsedData = parseResult["data"];
                parsedHeaders = parseResult["headers"];

                const step_status = parentStep2.querySelector('.step-status');
                var csvHeaderOkDiv = document.getElementById('freqCsvHeadersOK');
                var csvElemDescDiv = document.getElementById('freqCsvElementsDesc');

                if (!parsedData || parsedData.size === 0 || parsedHeaders.length <= 0) {
                    parsedData = undefined;
                    csvHeaderOkDiv.innerHTML = "-";
                    csvHeaderOkDiv.classList.add("red-color");
                    csvHeaderOkDiv.classList.remove("green-color");
                    csvElemDescDiv.innerHTML = 0;
                    csvElemDescDiv.classList.add("red-color");
                    csvElemDescDiv.classList.remove("green-color");
                    throw new Error("CSV is empty or could not be parsed.");
                }

                csvHeaderOkDiv.innerHTML = parsedHeaders.join(", ");
                if (!parsedHeaders.includes("MATRICULA")) {
                    parentStep3.style.display = "none";

                    csvHeaderOkDiv.classList.add("red-color");
                    csvHeaderOkDiv.classList.remove("green-color");

                    csvElemDescDiv.innerHTML = 0;
                    csvElemDescDiv.classList.add("red-color");
                    csvElemDescDiv.classList.remove("green-color");

                    step_status.innerHTML = "&#10060;";
                    throw new Error("CSV does not contain's `MATRICULA`.");
                }

                // CSV headers without MATRICULA
                const freqHeaderSet = new Set(["FREQ"]);
                const parsedHeaderSet = new Set(parsedHeaders.filter(item => !(item == "MATRICULA")));
                if (!areSetsEqual(freqHeaderSet, parsedHeaderSet)) {
                    parentStep3.style.display = "none";
                    csvHeaderOkDiv.classList.add("red-color");
                    csvHeaderOkDiv.classList.remove("green-color");

                    csvElemDescDiv.innerHTML = 0;
                    csvElemDescDiv.classList.add("red-color");
                    csvElemDescDiv.classList.remove("green-color");

                    step_status.innerHTML = "&#10060;";
                    throw new Error("The uploaded CSV does NOT have the same columns as the freq header in the webpage.");
                } else {
                    csvHeaderOkDiv.classList.add("green-color");
                    csvHeaderOkDiv.classList.remove("red-color");
                }

                csvElemDescDiv.innerHTML = parsedData.size;
                if (parsedData.size <= 0) {
                    parentStep3.style.display = "none";
                    csvElemDescDiv.classList.add("red-color");
                    csvElemDescDiv.classList.remove("green-color");
                    step_status.innerHTML = "&#10060;";
                    throw new Error("CSV content is empty.");
                } else {
                    csvElemDescDiv.classList.add("green-color");
                    csvElemDescDiv.classList.remove("red-color");
                    step_status.innerHTML = "&#9989;";
                }

                // ready for final step
                parentStep3.style.display = "block";
                showStatus("CSV data ready to fill the form!", "success");
            } catch (err) {
                showStatus(err.message, "error");
            }
        };

        reader.onerror =
            function () {
                showStatus("Failed to parse CSV file.", "error");
            };

        reader.readAsText(file);
    });

    const fillFreqBtn = document.getElementById('fillFreqBtn');
    fillFreqBtn.addEventListener('click', () => {
        if (!parsedData) {
            showStatus("There is no available parsed CSV data for filling the form.", "error");
            return;
        }

        chrome.tabs.sendMessage(
            tab.id, {
            action: "fill_frequency_form",
            data: Object.fromEntries(parsedData.entries())
        }, (response) => {
            // Handle connection errors (e.g., content script not loaded)
            if (chrome.runtime.lastError) {
                showStatus("Error: Refresh the page and try again.", "error");
                return;
            }

            if (response && response.status === "success") {
                showStatus(`Success! ${response.message}.`, "success");
            } else {
                showStatus(`Error: ${response.message}`, "error");
            }
        });
    });
});