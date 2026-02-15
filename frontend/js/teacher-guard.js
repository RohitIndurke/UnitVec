(function () {
    const role = localStorage.getItem("role");

    if (role !== "teacher") {
        alert("Access denied");
        window.location.href = "../login/Teacher.html";
    }
})();
