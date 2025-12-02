export function getChangeFlat(result, target, modifierType, value, actor) {
    if (target.startsWith("pow"))
        result.push(`system.pow.${target.slice(3)}`);
    else
        return result;
}