import figlet from "figlet";

/**
 * Send formatted notification to console.
 * 
 * @param {string} message - notification message
 * @param {string} sender - notification source
 */
export default async function sendConsoleNotificationAsync(message, sender) {
    console.log(await figlet.text("Notification", {font: "ANSI Shadow"}));
    console.log(await figlet.text(`from ${sender}`, {font: "RubiFont"}));
    console.log(message);
    console.log("\n\n\n");
}