chrome.runtime.onInstalled.addListener(() => {
    console.log('Download Regex To Folder extension installed.');
});

class RegexData {
    constructor() {
        this.regexes = [];
        // Nothing = all domains
        this.domains = [];
        // Path relative to downloads folder
        this.path = '';
        this.enabled = true;
        this.order = 0;
        this.shouldStop = true;
    }
}

function getRegexData() {
    const regexData = localStorage.getItem('regexDataList');
    if (regexData) {
        const parsedRegexData = JSON.parse(regexData);
        return parsedRegexData.data.sort((a, b) => a.order - b.order);
    }

    return [];
}

function setRegexData(regexData) {
    localStorage.setItem('regexDataList', JSON.stringify({ data: regexData }));
}

const regexDataTest = new RegexData();
regexDataTest.regexes = ['.*\\.mkv', '.*\\.mp4'];
regexDataTest.domains = ['uptobox.com'];
regexDataTest.path = "Movies";

const regexTestDataImages = new RegexData();
regexTestDataImages.regexes = ['.*\\.png', '.*\\.jpg'];
regexTestDataImages.domains = [];
regexTestDataImages.path = "Images";

const testRegexData = [
    regexDataTest,
    regexTestDataImages
]

function isMatchingDomains(url, domains) {
    if (domains.length === 0) {
        return true;
    }

    const urlDomain = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
    console.log("Testing: " + urlDomain);
    return domains.includes(urlDomain);

}

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
    const url = item.url;
    const filename = item.filename;
    console.log(suggest);

    let finalPath = null;
    for (const regexData of testRegexData) {

        if (!regexData.enabled) {
            console.log("Not enabled");
            continue;
        }

        if (!isMatchingDomains(url, regexData.domains)) {
            console.log("Not matching domains");
            continue;
        }

        console.log("Testing: " + regexData.regexes);

        let isOneRegexMatching = false;

        for (const regex in regexData.regexes) {
            console.log("Testing: " + regexData.regexes[regex]);
            if (testRegex(regexData.regexes[regex], filename)) {
                isOneRegexMatching = true;
                break;
            }
        }

        if (!isOneRegexMatching) {
            console.log("Not matching");
            continue;
        }

        console.log("Matching");

        finalPath = regexData.path + '/' + filename;

        if (regexData.shouldStop) {
            console.log("Should stop");
            break;
        }

    }

    if (finalPath) {
        console.log("Suggesting: " + finalPath);
        suggest({ filename: finalPath });
    }


    // if (regex) {
    //     const newFilename = url.match(regex);
    //     if (newFilename) {
    //         suggest({filename: newFilename[0]});
    //     }
    // }
});

function testRegex(regexStr, filename) {
    const regex = new RegExp(regexStr);
    return regex.test(filename);
}