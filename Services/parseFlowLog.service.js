import fs from "fs";
import path from "path";
import { parse } from "csv-parse";

function findLookupTable(lookupTableFile) {
  const lookupTable = new Map();
  let lookupTableRecordsCount = 0;
  return new Promise((resolve, reject) => {
    fs.createReadStream(lookupTableFile)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
        })
      )
      .on("data", (data) => {
        const [dstport, protocol, tag] = Object.values(data);
        if (dstport && protocol && tag) {
          const key = `${dstport.trim()}_${protocol.trim().toLowerCase()}`;
          lookupTable.set(key, tag.trim().toLowerCase());
          lookupTableRecordsCount++;
        }
      })
      .on("end", () => {
        if (lookupTableRecordsCount > 10000) {
          return reject(
            new Error(
              "Warning: Lookup table has more than 10,000 mappings. Cannot proceed with TagCount and PortProtocolCombinationCount."
            )
          );
        }
        resolve(lookupTable);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

async function parseFlowLogData(flowLog, lookupTable) {
  const tagCounts = new Map();
  const portProtocolCombinationCounts = new Map();
  const protocols = new Map([
    // This decimal to protocol mapping was identified and captured from https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml.
    [6, "tcp"],
    [17, "udp"],
    [1, "icmp"],
    [2, "igmp"],
    [4, "ipv4"],
    [5, "stream"],
  ]);
  return new Promise((resolve, reject) => {
    let flowLogList = "";
    fs.createReadStream(flowLog)
      .on("data", (data) => {
        flowLogList += data;
        if (flowLogList) {
          let flowLogs = flowLogList.split("\n");
          flowLogs.forEach((flowLog) => {
            flowLog = flowLog.split(" ");
            if (flowLog.length === 14) {
              const dstport = flowLog[6];
              const protocolNumber = parseInt(flowLog[7]);
              const protocol = protocols.get(protocolNumber);
              const tagKey = `${dstport}_${protocol}`;
              const tagValue = lookupTable.get(tagKey) || "Untagged";
              tagCounts.set(tagValue, (tagCounts.get(tagValue) || 0) + 1);
              const portProtocolCombinationKey = `${dstport},${protocol}`;
              portProtocolCombinationCounts.set(
                portProtocolCombinationKey,
                (portProtocolCombinationCounts.get(
                  portProtocolCombinationKey
                ) || 0) + 1
              );
            }
          });
        }
      })
      .on("end", function () {
        resolve({ tagCounts, portProtocolCombinationCounts });
      })
      .on("error", function (err) {
        reject(err);
      });
  });
}

function saveToCSVFile(tagCounts, portProtocolCombinationCounts, outputFolder) {
  const outputLines = [];
  outputLines.push("Tag,Count");
  tagCounts.forEach((count, tag) => {
    outputLines.push(`${tag},${count}`);
  });
  outputLines.push("");
  outputLines.push("Port,Protocol,Count");
  portProtocolCombinationCounts.forEach((count, key) => {
    const [port, protocol] = key.split(",");
    outputLines.push(`${port},${protocol},${count}`);
  });
  fs.writeFileSync(
    path.join(outputFolder, "result.csv"),
    outputLines.join("\n")
  );
}

async function getTagCount(req) {
  try {
    const lookupTableFile = path.join("media", "lookuptable.csv");
    const flowLogFile = path.join("media", req.file.filename);
    const outputFolder = path.join("media", "output");
    const lookupTable = await findLookupTable(lookupTableFile);
    const { tagCounts, portProtocolCombinationCounts } = await parseFlowLogData(
      flowLogFile,
      lookupTable
    );
    saveToCSVFile(tagCounts, portProtocolCombinationCounts, outputFolder);
    fs.unlink(flowLogFile, (err) => {
      if (err) console.log("Error deleting flowLog file");
    });
    return {
      error: false,
      message:
        "The tag count and port-protocol combination tables have been genereatad are saved in media/output folder under the name result.csv",
      tagCount: JSON.parse(JSON.stringify(Object.fromEntries(tagCounts))),
      portProtocolCombination: JSON.parse(
        JSON.stringify(Object.fromEntries(portProtocolCombinationCounts))
      ),
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
}

export default { getTagCount };
