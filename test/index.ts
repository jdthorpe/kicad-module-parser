(async () => {
    process.stdout.write("Running boards...");
    await require("./board-test").default;
    console.log("DONE");
    process.stdout.write("Running modules...");
    await require("./module-test").default;
    console.log("DONE");
})();
