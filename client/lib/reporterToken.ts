export function getReporterToken(): string {
    if (typeof window === "undefined") return "server";

    let token = localStorage.getItem("bandobast_reporter_token");
    if (!token) {
        token = crypto.randomUUID();
        localStorage.setItem("bandobast_reporter_token", token);
    }
    return token;
}