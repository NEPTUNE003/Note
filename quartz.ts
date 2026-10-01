import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"
import RandomKnowledge from "./quartz/components/RandomKnowledge"

// Register local components before config/layout load so buildLayoutForEntries can resolve them
componentRegistry.register("@local/random-knowledge", RandomKnowledge, "local:RandomKnowledge")
componentRegistry.register("random-knowledge", RandomKnowledge, "local:RandomKnowledge")

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
