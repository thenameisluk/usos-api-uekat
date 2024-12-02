import { HTMLElement, parse } from "npm:node-html-parser";

export type time = [
  number,
  number,
];

export type subject = {
  name: string;
  info: string | undefined;
  time: {
    start: time;
    end: time;
  } | undefined;
  place?: string | undefined;
  teach?: string | undefined;
};

function cspace(s: string) {
  let news = "";

  for (let i = 0; i < s.length; i++) {
    if (
      !(s[i] == " " &&
        (s[i - 1] == " " || s[i - 1] == "\n" || i == s.length - 1))
    ) {
      news += s[i];
    }
  }

  return news.replaceAll(/\&nbsp\;/g, "").replace("\n", "");
}

function extract(sub: HTMLElement, attr: string) {
  const txt = sub.querySelector('[slot="' + attr + '"]')?.innerText;

  if (!txt) {
    return undefined;
  }

  return cspace(txt);
}

function yeehTime(ye: string) {
  const uw = ye.split(":");
  return [Number.parseInt(uw[0]), Number.parseInt(uw[1])];
}

function parseTime(t: string | undefined) {
  try {
    if (!t) {
      return;
    }

    t = t.replaceAll(" ", "");

    const times = t.split("—");

    return {
      start: yeehTime(times[0]) as time,
      end: yeehTime(times[1]) as time,
    };
  } catch {
    return undefined;
  }
}

export function parsePlan(rawplan: string) {
  const doc = parse(rawplan);

  const blob = doc.querySelectorAll("div>timetable-day");

  let day = 0;

  const plan: subject[][] = [];

  blob.forEach((e) => {
    const sday: subject[] = [];
    e.querySelectorAll("timetable-entry").forEach((sub) => {
      const subj: subject = {
        name: sub.attributes["name"],
        info: extract(sub, "info"),
        time: parseTime(extract(sub, "dialog-event")),
        place: extract(sub, "dialog-place"),
        teach: extract(sub, "dialog-person"),
      };
      if (!subj.place) {
        delete subj.place;
      }
      if (!subj.teach) {
        delete subj.teach;
      }

      sday.push(subj);
    });
    plan.push(sday);
    day++;
  });

  return plan;
}
