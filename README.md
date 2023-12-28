# Brotato All-Characters Challenge Overlay

This is the source code to a Twitch overlay for a Brotato challenge done by [AdmiralBahroo](https://www.twitch.tv/admiralbahroo). If you want to use this for yourself, feel free to do so.

## Usage

### Installation

The easiest way to get started is to download the application bundle from the Releases section. Click on the Initial Release and click on `brotater_v0.1.zip` to start your download. Once it's complete, simply extract the folder where you want it and run the `brotato-overlay.exe` inside.

Alternatively, if you want to compile the binaries yourself, you can clone this repository and compile with `cargo`. Just make sure to include the `public` folder from this repository to wherever your binaries get saved to.

### Utilization

After running the `.exe`, you should get a terminal window that appears notifying you that the application is ready to go and the URLs to find each part of the application: the overlay at [localhost:3000](localhost:3000) and the controller at [localhost:3000/controller](localhost:3000/controller). Open the `localhost:3000/controller` page in your browser (for best results, use Chrome) and use it to update your progress in the challenge. While that is open, in OBS you should create a browser capture using `localhost:3000` as the URL for that capture. Set the width and height to our output resolution and remove all custom CSS if any appears in the box. Ensure that the `Shutdown source when not visible` option is **not** checked.

> If you leave the browser capture up in your scene and restart the application, make sure to refresh the browser capture. The page makes a connection to the application whenever it gets refreshed. A good rule of thumb; if you notice that the terminal says to try refreshing the browser capture, refresh it!

Once you have all the tabs open, make sure you don't close the terminal! Once you're done with the overlay, feel free to close it but **closing it while using the application will result in your data not saving.**
