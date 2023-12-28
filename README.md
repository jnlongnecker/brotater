# Brotato All-Characters Challenge Overlay

This is the source code to a Twitch overlay for a Brotato challenge done by [AdmiralBahroo](https://www.twitch.tv/admiralbahroo). If you want to use this for yourself, feel free to do so.

## Usage

### Installation

The easiest way to get started is to download the application bundle from the Releases section. Click on the Initial Release and click on `brotater_v0.1.zip` to start your download. Once it's complete, simply extract the folder where you want it and run the `brotato-overlay.exe` inside.

Alternatively, if you want to compile the binaries yourself, you can clone this repository and compile with `cargo`. Just make sure to include the `public` folder from this repository to wherever your binaries get saved to.

### Utilization

After running the `.exe`, you should get a terminal window that appears notifying you that the application is ready to go and to open two tabs on your browser: [localhost:3000](localhost:3000) and [localhost:3000/controller](localhost:3000/controller). **You must have both tabs open at the same time!** Use the `controller` page in order to update your run and use the [localhost:3000](localhost:3000) page as the actual overlay in OBS (or your streaming software of choice). The overlay will sit in the top right corner of the screen in order to avoid obscuring relevant game information. For your browser capture, make sure to set the `width` and `height` to your output resolution and the `url` to `locahost:3000`.

Once you have all the tabs open, make sure you don't close the command prompt! Once you're done with the overlay, feel free to close it but **closing it while using the application will result in your data not saving.**
