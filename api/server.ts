import { Request, Response } from 'express';

import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const regex = /^(?<subjectCode>\d{4})\/(?<component>\d{2})\/(?<seasonCode>\w\/\w)\/(?<yearPartial>\d{2})$/;  // regex to split paper code

class PaperNotFoundError extends Error {
    level: number;

    constructor(msg: string, level: number) {
        super(msg);
        this.level = level;
        Object.setPrototypeOf(this, PaperNotFoundError.prototype);
    }
}

async function urlExists(url: string) {
    const res = await fetch(url, { method: "HEAD" });
    return res.status === 200;
}

type Map<T> = { [key: string]: T };
type UrlGetter = (code: string, type: string) => string[];

const BestExamHelp = (function (): UrlGetter {
    const urlTemplate = "https://bestexamhelp.com/exam/cambridge-igcse/{subjectName}-{subjectCode}/{year}/{subjectCode}_{seasonLetter}{yearPartial}_{type}_{component}.pdf";
    const subjects: Map<string> = {
        "0452": "accounting",
        "0508": "arabic-first-language",
        "0400": "art-and-design",
        "0600": "agriculture",
        "0610": "biology",
        "0450": "business-studies",
        "0620": "chemistry",
        "0478": "computer-science",
        "0509": "chinese-first-language",
        "0411": "drama",
        "0455": "economics",
        "0500": "english-first-language",
        "0524": "english-first-language-us",
        "0475": "english-literature",
        "0680": "environmental-management",
        "0454": "enterprise",
        "0648": "food-and-nutrition",
        "0501": "french-first-language",
        "0460": "geography",
        "0457": "global-perspectives",
        "0470": "history",
        "0493": "islamiyat",
        "0580": "mathematics",
        "0606": "mathematics-additional",
        "0607": "mathematics-international",
        "0410": "music",
        "0696": "malay-first-language",
        "0625": "physics",
        "0413": "physical-education",
        "0490": "religious-studies",
        "0653": "science-combined",
        "0654": "sciences-co-ordinated",
        "0495": "sociology",
        "0502": "spanish-first-language",
        "0471": "travel-and-tourism",
    };
    const seasonLetters: Map<string> = {
        "M/J": "s",
        "F/M": "m",
        "O/N": "w",
    };

    return function (code: string, type: string) {
        const matches = regex.exec(code.toUpperCase());

        if (!matches) throw new PaperNotFoundError("Invalid paper code", 0);

        const replaces = { ...matches.groups };
        replaces.subjectName = subjects[replaces.subjectCode];
        replaces.year = "20" + replaces.yearPartial;
        replaces.seasonLetter = seasonLetters[replaces.seasonCode];
        replaces.type = type;

        if (replaces.subjectName === undefined) throw new PaperNotFoundError("Could not find subject", 1);

        let url = urlTemplate;
        for (const key in replaces) {
            if (replaces[key] === undefined) throw new PaperNotFoundError("Invalid paper code", 0);
            url = url.replace(new RegExp(`{${key}}`, "g"), replaces[key]);
        }

        return [url];
    };
})();

const GCEGuide = (function (): UrlGetter {
    const urlTemplate = "https://papers.gceguide.com/Cambridge%20IGCSE/{subjectName}%20({subjectCode})/{year}/{subjectCode}_{seasonLetter}{yearPartial}_{type}_{component}.pdf";
    const subjects: Map<string> = {
        "0452": "Accounting",
        "0985": "Accounting (9-1)",
        "0548": "Afrikaans - Second Language",
        "0600": "Agriculture",
        "0508": "Arabic - First Language",
        "7184": "Arabic - First Language (9-1)",
        "0544": "Arabic - Foreign Language",
        "0400": "Art & Design",
        "0989": "Art & Design (9-1)",
        "0538": "Bahasa Indonesia",
        "0610": "Biology",
        "0970": "Biology (9-1)",
        "0450": "Business Studies",
        "0986": "Business Studies (9-1)",
        "0620": "Chemistry",
        "0971": "Chemistry (9-1)",
        "0547": "Chinese (Mandarin) - Foreign Language",
        "0509": "Chinese - First Language",
        "0523": "Chinese - Second Language",
        "0478": "Computer Science",
        "0984": "Computer Science (9-1)",
        "0420": "Computer Studies",
        "0445": "Design & Technology",
        "0979": "Design & Technology (9-1)",
        "0453": "Development Studies",
        "0411": "Drama",
        "0994": "Drama (9-1)",
        "0515": "Dutch - Foreign Language",
        "0455": "Economics",
        "0987": "Economics (9-1)",
        "0500": "English - First Language",
        "0990": "English - First Language (9-1)",
        "0627": "English - First Language (9-1) (UK only)",
        "0522": "English - First Language (UK)",
        "0524": "English - First Language (US)",
        "0486": "English - Literature",
        "0477": "English - Literature (9-1) (UK only)",
        "0427": "English - Literature (US)",
        "0475": "English - Literature in English",
        "0992": "English - Literature in English (9-1)",
        "0991": "English - Second Language (9-1)",
        "0511": "English as a Second Language (Count-in speaking)",
        "0510": "English as a Second Language (Speaking endorsement)",
        "0993": "English as a Second Language (Speaking endorsement) (9-1)",
        "0454": "Enterprise",
        "0680": "Environmental Management",
        "0648": "Food & Nutrition",
        "7156": "French (9-1)",
        "0501": "French - First Language",
        "0520": "French - Foreign Language",
        "0460": "Geography",
        "0976": "Geography (9-1)",
        "7159": "German (9-1)",
        "0505": "German - First Language",
        "0525": "German - Foreign Language",
        "0457": "Global Perspectives",
        "0549": "Hindi as a Second Language",
        "0470": "History",
        "0977": "History (9-1)",
        "0409": "History - American (US)",
        "0447": "India Studies",
        "0417": "Information and Communication Technology",
        "0983": "Information and Communication Technology (9-1)",
        "0531": "IsiZulu as a Second Language",
        "0493": "Islamiyat",
        "7164": "Italian (9-1)",
        "0535": "Italian - Foreign Language",
        "0480": "Latin",
        "0696": "Malay - First Language",
        "0546": "Malay - Foreign Language",
        "0697": "Marine Science",
        "0580": "Mathematics",
        "0980": "Mathematics (9-1)",
        "0444": "Mathematics (US)",
        "0606": "Mathematics - Additional",
        "0607": "Mathematics - International",
        "0410": "Music",
        "0978": "Music (9-1)",
        "0448": "Pakistan Studies",
        "0413": "Physical Education",
        "0995": "Physical Education (9-1)",
        "0652": "Physical Science",
        "0625": "Physics",
        "0972": "Physics (9-1)",
        "0504": "Portuguese - First Language",
        "0490": "Religious Studies",
        "0499": "Sanskrit",
        "0653": "Science - Combined",
        "0973": "Sciences - Co-ordinated (9-1)",
        "0654": "Sciences - Co-ordinated (Double)",
        "0495": "Sociology",
        "7160": "Spanish (9-1)",
        "0502": "Spanish - First Language",
        "0530": "Spanish - Foreign Language",
        "0488": "Spanish - Literature",
        "0262": "Swahili",
        "0518": "Thai - First Language",
        "0471": "Travel & Tourism",
        "0513": "Turkish - First Language",
        "0539": "Urdu as a Second Language",
        "0408": "World Literature",
    };
    const seasonLetters: Map<string> = {
        "M/J": "s",
        "F/M": "m",
        "O/N": "w",
    };
    return function (code: string, type: string) {
        const matches = regex.exec(code.toUpperCase());

        if (!matches) throw new PaperNotFoundError("Invalid paper code", 0);

        const replaces = { ...matches.groups };
        replaces.subjectName = subjects[replaces.subjectCode];
        replaces.year = "20" + replaces.yearPartial;
        replaces.seasonLetter = seasonLetters[replaces.seasonCode];
        replaces.type = type;

        if (replaces.subjectName === undefined) throw new PaperNotFoundError("Could not find subject", 1);

        let url = urlTemplate;
        for (const key in replaces) {
            if (replaces[key] === undefined) throw new PaperNotFoundError("Invalid paper code", 0);
            url = url.replace(new RegExp(`{${key}}`, "g"), encodeURIComponent(replaces[key]));
        }

        return [url];
    };
})();

const servers: UrlGetter[] = [BestExamHelp, GCEGuide];

// api endpoints
const app = express();

app.get("/", cors(), (req: Request, res: Response) => {
    if (req.query.code === undefined || req.query.type === undefined) {
        res.status(200).json({ success: 0, message: "Queries not provided" });
        return;
    }

    let urls: string[] = [];
    let lowestErr = new PaperNotFoundError("Internal server error", -1);
    for (let getPaperUrls of servers) {
        try {
            urls.push(...getPaperUrls(req.query.code.toString(), req.query.type.toString()));
        } catch (_err) {
            const err = _err as PaperNotFoundError;
            if (err.level > lowestErr.level) lowestErr = err;
        }
    }

    if (urls.length <= 0) {
        res.status(200).json({ success: 0, message: lowestErr.message });
        return;
    }

    (async () => {
        for (const url of urls) {
            console.log(url);
            if (await urlExists(url)) {
                res.status(200).json({ url: url, success: 1 });
                return;
            }
        }
        res.status(200).json({ success: 0, message: "Could not find paper" });
    })();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => { console.log(`Server listening on port ${PORT}...`); });
