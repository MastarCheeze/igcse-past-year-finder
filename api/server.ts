import { Request, Response } from 'express';

import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const regex = /^(?<subjectCode>\d{4})\/(?<component>\d{2})\/(?<seasonCode>\w\/\w)\/(?<yearPartial>\d{2})$/;  // regex to split paper code
const urlTemplate = "https://bestexamhelp.com/exam/cambridge-igcse/{subjectName}-{subjectCode}/{year}/{subjectCode}_{season}{yearPartial}_{type}_{component}.pdf";

const subjects: { [key: string]: string } = {
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

const seasons: { [key: string]: string } = {
    "M/J": "s",
    "F/M": "m",
    "O/N": "w",
};

async function urlExists(url: string) {
    const res = await fetch(url, { method: "HEAD" });
    return res.status === 200;
}

function getPaperUrl(code: string, type: string) {
    const matches = regex.exec(code.toUpperCase());

    if (!matches) throw new Error("Invalid paper code");

    const replaces = { ...matches.groups };
    replaces.subjectName = subjects[replaces.subjectCode];
    replaces.year = "20" + replaces.yearPartial;
    replaces.season = seasons[replaces.seasonCode];
    replaces.type = type;

    if (replaces.subjectName === undefined) throw new Error("Could not find subject");

    let url = urlTemplate;
    for (const key in replaces) {
        if (replaces[key] === undefined) throw new Error("Invalid paper code");
        url = url.replace(new RegExp(`{${key}}`, "g"), replaces[key]);
    }

    return url;
}

// api endpoints
const app = express();

app.get("/", cors(), (req: Request, res: Response) => {
    if (req.query.code === undefined || req.query.type === undefined) {
        res.status(200).json({ success: 0, message: "Queries not provided" });
        return;
    }

    let url: string;
    try {
        url = getPaperUrl(req.query.code.toString(), req.query.type.toString());
    } catch (_err) {
        const err = _err as Error;
        console.log(err);
        res.status(200).json({ success: 0, message: err.message });
        return;
    }

    (async () => {
        if (await urlExists(url)) res.status(200).json({ url: url, success: 1 });
        else res.status(200).json({ success: 0, message: "Could not find paper" });
    })();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => { console.log(`Server listening on port ${PORT}...`); });
