import path from "path"
import { fileURLToPath } from "url"
import { promises } from "fs"

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const shaclDirs = [
    `${ROOT}/shacl`,
    `${ROOT}/shacl/beta`,
    `${ROOT}/shacl/bielefeld`
]
let shaclFiles = []
for (let shaclDir of shaclDirs) {
    shaclFiles = shaclFiles.concat((await promises.readdir(shaclDir)).map(file => `${shaclDir}/${file}`).filter(file => file.endsWith(".ttl")))
}

for (let file of shaclFiles) {
    // let filename = path.basename(file)
    let content = await promises.readFile(file, "utf8")
    const cls = "ff:RequirementProfile"
    const regex = new RegExp(`^([^\\s#;]+)\\s+a\\s+${cls}\\b`, "gm")
    const matches = [... content.matchAll(regex)].map(m => m[1].trim())
    console.log(matches[0])
    /*for (let match of matches) {
        const hash = Math.random().toString(36).slice(2, 5)
        content = content.split(match).join(`${match}_${hash}`)
    }
    await promises.writeFile(file, content, "utf8")*/
}
