# API-Cheat-Tool
Able to see all the interactions and data between an API/Cookie and website
Good for making hacks for browser games.

# How it stays undetected
Just cause the code is obfuscated does not mean its completely undetectable however these are the measures I put in place to make it mostly undetectable:

1. It stops console errors and warnings to make sure it stays undetected. 
2. It's heavily obfuscated with deadcode, weird prefix identifiers, strings, arrays, lots of functions and mangeled identifyers.
3. It carefully logs API and cookie data without changing bearer codes API keys etc so the network can keep working thus giving you more and more info.
4. Takes the normal window.fetch stores it and replaces it with a custom aysnc function.

# Warning
**I'm not responsable for any criminal behaviour any person('s) do with my script. You using it for something illegal is your choice and your issue only.**
**It's been obfuscated to make it harder to edit so a person cant reverse engineer it to access peoples accounts etc**
**It's only purpose is to show what an API and cookies are doing by showing payloads, responses, cookie data and API keys.**
