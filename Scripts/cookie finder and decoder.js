(function() {
    const cookieString = document.cookie;
    if (!cookieString) {
        console.log("No cookies found.");
        return;
    }

    const cookies = cookieString.split("; ");

    cookies.forEach(cookie => {
        const [name, ...rest] = cookie.split("=");
        const value = rest.join("="); // Handles '=' in cookie values
        try {
            const decodedName = decodeURIComponent(name);
            const decodedValue = decodeURIComponent(value);
            console.log(`Cookie name: ${decodedName}`);
            console.log(`Cookie value: ${decodedValue}`);
            console.log('---');
        } catch (e) {
            console.log(`Cookie name: ${name}`);
            console.log(`Cookie value: ${value}`);
            console.log('(Could not decode this cookie)');
            console.log('---');
        }
    });
})();
