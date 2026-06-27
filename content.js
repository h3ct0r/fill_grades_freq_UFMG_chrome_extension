function getAvHeadersMap() {
    var avToId = new Map();

    try {
        // get list of avaliations from the table header
        var parentElement = document.getElementById("notasHead");
        if (!parentElement) {
            throw new Error("Element with id 'notasHead' not found");
        }

        var avList = parentElement.querySelectorAll('a');

        // get the first element 
        var tblAv = document.getElementById("tabelaAvaliacoes");
        if (!tblAv) {
            throw new Error("Element with id 'tabelaAvaliacoes' not found");
        }

        var trList = tblAv.querySelectorAll('tr');
        var inputList = trList[0].querySelectorAll('input');

        const avIdRegex = /^@.*_(\d)$/;
        var avSize = avList.length;

        for (let i = 0; i < avSize; i++) {
            var avElement = avList[i];
            var avText = avElement.innerText
            var inputElement = inputList[i];
            const result = inputElement.id.match(avIdRegex);
            if (!result) {
                throw new Error("avIdRegex: Element with id '" + avIdRegex + "' not found");
            }

            avToId.set(avText, result[1]);
            console.log(avText, result[1]);
        }
    } catch (error) {
        // @ts-ignore
        console.error("[ERROR] Problem parsing page for AV information:", error.message);
    }

    return avToId;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "get_av_headers") {
        var avToId = getAvHeadersMap();
        console.log("avToId:", avToId);

        if (avToId.size <= 0) {
            sendResponse(
                { status: "error", message: "No AV headers found, check URL and try again" });
            return;
        }

        const keysArray = [...avToId.keys()];
        const keysStringComma = keysArray.join(", ");
        sendResponse({
            status: "success",
            message: keysStringComma
        });
    }
    else if (request.action === "fill_grade_form") {
        if (document.querySelectorAll('.tit_on').length <= 0) {
            sendResponse(
                { status: "error", message: "Current page is not `Lançamento de Notas/Todas as Avaliações`, check URL and try again" });
            return;
        }

        try {
            const csvDataMap = new Map(Object.entries(request.data));
            const columnsToFill = request.columns || null;

            let filledCount = 0;
            let missingFieldsSet = new Set([]);

            var avToId = getAvHeadersMap();
            console.log("avToId:", avToId);
            console.log("csvDataMap:", csvDataMap);

            for (const [matricula, value] of csvDataMap) {
                console.log(matricula, value);

                var isFound = true;
                for (var avKeyName in value) {
                    if (columnsToFill && !columnsToFill.includes(avKeyName)) continue;
                    if (!avToId.has(avKeyName)) continue;

                    var avKeyId = avToId.get(avKeyName);
                    var avValue = value[avKeyName];

                    // use the weird field id `@XXXXX_Y` for each one of the evaluations
                    // where XXXX is the matricula and Y is the evaluation index
                    var idAvName = "@" + matricula + "_" + avKeyId;
                    var avMatriculaKey = document.getElementById(idAvName);
                    if (!avMatriculaKey || avMatriculaKey.disabled) {
                        isFound = false;
                        missingFieldsSet.add(matricula);
                        continue;
                    }

                    // the form uses comma-separated decimal places
                    avValue = avValue.replace(/\./g, ',');
                    avMatriculaKey.value = avValue;
                }

                if (isFound) filledCount++;
            }

            if (filledCount === 0) {
                // error
                sendResponse({
                    status: "error",
                    message: "No matching form fields found"
                });
            } else if (missingFieldsSet.size > 0) {
                // partial success
                sendResponse({
                    status: "success",
                    message: `Filled ${filledCount} rows. Could not find: ${missingFieldsSet.size}`
                });
            } else {
                // full success
                sendResponse({
                    status: "success",
                    message: `Filled ${filledCount} rows`
                });
            }

        } catch (e) {
            sendResponse({ status: "error", message: "[content.js]" + e.toString() });
        }
    }
    else if (request.action === "check_if_in_total_freq_page") {
        var isBaseTotalFreqFound = document.querySelectorAll(".tbNavegacao")[0].querySelector(".tit_on").innerText.includes("Total de Faltas");
        var tabelaFreq = document.getElementById("tabelaFrequencias");
        if (isBaseTotalFreqFound && tabelaFreq) {
            sendResponse({
                status: "success"
            });
        }
        else {
            sendResponse({
                status: "error",
                message: "No frequency form found, please check URL"
            });
        }
    }
    else if (request.action === "fill_frequency_form") {
        if (document.querySelectorAll('.tit_on').length <= 0) {
            sendResponse(
                { status: "error", message: "Current page is not `Lançamento do Total de Faltas no Semestre`, check URL and try again" });
            return;
        }

        try {
            const csvDataMap = new Map(Object.entries(request.data));

            let filledCount = 0;
            let missingFieldsSet = new Set([]);

            // iterate through CSV data
            for (const [matricula, value] of csvDataMap) {
                var freqValue = value["FREQ"];
                console.log(matricula, freqValue);

                // use the weird field id `@XXXXX_Y` for each one of the evaluations
                // where XXXX is the matricula and Y is the evaluation index
                var idFreqName = "@" + matricula;
                var freqByName = document.getElementsByName(idFreqName);
                if (!idFreqName || freqByName.length <= 0 || freqByName[0].disabled) {
                    isFound = false;
                    missingFieldsSet.add(matricula);
                    continue;
                }

                filledCount++;
                freqByName[0].value = freqValue;
            }

            if (filledCount === 0) {
                // error
                sendResponse({
                    status: "error",
                    message: "No matching form fields found"
                });
            } else if (missingFieldsSet.size > 0) {
                // partial success
                sendResponse({
                    status: "success",
                    message: `Filled ${filledCount} rows. Could not find: ${missingFieldsSet.size}`
                });
            } else {
                // full success
                sendResponse({
                    status: "success",
                    message: `Filled ${filledCount} rows`
                });
            }

        } catch (e) {
            sendResponse({ status: "error", message: "[content.js]" + e.toString() });
        }
    }

    return true;
});