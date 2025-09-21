import path from "path"
import { fileURLToPath } from "url"
import { promises as fsPromise, writeFileSync } from "fs"
import { newStore, addTurtleToStore, storeToTurtle, sparqlInsertDelete } from "@foerderfunke/sem-ops-utils"

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)))
const turtleFiles = [
    `${dir}/datafields.ttl`,
    `${dir}/bielefeld/datafields-bielefeld.ttl`,
    `${dir}/definitions.ttl`,
    `${dir}/materialization.ttl`
]

let defStore = newStore()
for (let file of turtleFiles) {
    addTurtleToStore(defStore, await fsPromise.readFile(file, "utf8"))
}

// ensure language tag @de-x-es: if not present, copy from @de
const query = `
    PREFIX ff: <https://foerderfunke.org/default#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX schema: <http://schema.org/>
    INSERT {
        ?subj ?pred ?labelDeEs .
    } WHERE {
        ?subj ?pred ?labelDe .
        FILTER(?pred IN (rdfs:label, schema:question, rdfs:comment, ff:title, ff:benefitInfo, ff:ineligibleGeneralExplanation))
        FILTER(LANG(?labelDe) = "de")
        FILTER NOT EXISTS {
            ?subj ?pred ?any .
            FILTER(LANG(?any) = "de-x-es")
        }
        BIND(STRLANG(STR(?labelDe), "de-x-es") AS ?labelDeEs)
    }`
await sparqlInsertDelete(query, defStore)

await fsPromise.mkdir(`${dir}/build`, { recursive: true })
writeFileSync(`${dir}/build/def.built.ttl`, await storeToTurtle(defStore), "utf8")
