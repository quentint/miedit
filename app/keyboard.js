"use strict"
/**
 * @file keyboard
 * @author Frédéric BISSON <zigazou@free.fr>
 * @version 1.0
 * 
 * Keyboard simulates a Minitel keyboard from a standard keyboard.
 */

/**
 * The EmitterHandler callback handles code sequences generated by a Keyboard
 * object.
 * @name EmitterHandler
 * @function
 * @param {Int[]} sequence Minitel code sequence
 */

/**
 * The ConfigHandler callback handles settings changes.
 * @name ConfigHandler
 * @function
 * @param {Object} settings Settings value
 */

/**
 * Keyboard converts keys received by the browser into Minitel keys.
 */
class Keyboard {
    /**
     * @param {HTMLElement} container Element containing all keyboard elements.
     * @param {EmitterHandler} emitter An emitter handler that will be called
     *                                 everytime a key generates Minitel codes.
     * @param {ConfigHandler} emitter A config handler that will be called
     *                                 everytime the user changes a setting.
     */
    constructor(container, emitter, config) {
        /**
         * Remembers if the ctrl key is down.
         * @member {boolean}
         * @private
         */
        this.kCtrl = false

        /**
         * Remembers if the shift key is down.
         * @member {boolean}
         * @private
         */
        this.kShift = false

        /**
         * Remembers if the fnct key is down.
         * @member {boolean}
         * @private
         */
        this.kFnct = false

        /**
         * Does the keyboard works in extended mode?
         * @member {boolean}
         * @private
         */
        this.kExtended = false

        /**
         * Does the keyboard generates code for the cursor keys?
         * @member {boolean}
         * @private
         */
        this.kCursorKeys = false

        /**
         * Does the keyboard works in uppercase mode? (default mode of Minitel)
         * @member {boolean}
         * @private
         */
        this.kUppercase = true

        /**
         * The EmitterHandler associated with the keyboard.
         * @member {EmitterHandler}
         * @private
         */
        this.emitter = null
        this.setEmitter(emitter)

        /**
         * The ConfigHandler associated with the keyboard.
         * @member {ConfigHandler}
         * @private
         */
        this.config = null
        this.setEmitter(config)

        /**
         * The ConfigHandler associated with the keyboard.
         * @member {ConfigHandler}
         * @private
         */
        this.config = null

        /**
         * The alphabetical keys page.
         * @member {HTMLElement}
         * @private
         */
        this.pageAlpha = container.getElementsByClassName("page-alpha")[0]

        /**
         * The non-alphabetical keys page.
         * @member {HTMLElement}
         * @private
         */
        this.pageNAlpha = container.getElementsByClassName("page-non-alpha")[0]

        /**
         * The config page.
         * @member {HTMLElement}
         * @private
         */
        this.pageConfig = container.getElementsByClassName("page-config")[0]

        this.simulator = new KeySimulator(
            container.getElementsByClassName("minitel-standardkey")[0]
        )

        document.addEventListener("keyup", event => this.onkeyup(event))
        document.addEventListener("keypress", event => this.onkeypress(event))
        document.getElementsByClassName("keyboard-grid")[0].autocallback(this)
    }

    /**
     * Defines an EmitterHandler which will be called everytime a key is
     * is pressed.
     * @member {EmitterHandler}
     */
     setEmitter(emitter) {
        if(emitter === undefined) emitter = null

        this.emitter = emitter
    }

    /**
     * Handles key press events.
     * @private
     */
    keypress(keycodes) {
        if(this.emitter !== null && keycodes !== null) {
            this.emitter(keycodes)
        }
    }

    /**
     * Defines a ConfigHandler which will be called everytime a setting is
     * changed by the user.
     * @member {ConfigHandler}
     */
    setConfig(config) {
        if(config === undefined) config = null

        this.config = config
    }

    /**
     * Select the speed on the config form.
     * @param {string} speed "1200", "4800", "9600" or "FULL"
     */
    selectSpeed(speed) {
        this.pageConfig.querySelectorAll('input[name="config-speed"]').forEach(
            element => {
                if(element.value === speed) element.checked = true
            }
        )
    }

    /**
     * Select the color on the config form.
     * @param {string} color "true" or "false"
     */
    selectColor(color) {
        this.pageConfig.querySelectorAll('input[name="config-color"]').forEach(
            element => {
                if(element.value === color) element.checked = true
            }
        )
    }

    /**
     * Handles settings changes.
     * @param {HTMLEvent} event 
     * @param {string} param
     * @private
     */
    onSettingChanged(event, param) {
        if(this.config === null) return

        const speed = event
                    .target
                    .querySelector('input[name="config-speed"]:checked')
                    .value

        const color = event
                    .target
                    .querySelector('input[name="config-color"]:checked')
                    .value

        this.config({
            speed: speed === "FULL" ? 0 : parseInt(speed),
            color: color === "true"
        })
    }

    /**
     * Handles Alpha button event.
     * @private
     */
    onAlpha(event) {
        this.pageNAlpha.classList.add("hidden")
        this.pageConfig.classList.add("hidden")
        this.pageAlpha.classList.remove("hidden")
    }

    /**
     * Handles NAlpha button event.
     * @private
     */
    onNAlpha(event) {
        this.pageAlpha.classList.add("hidden")
        this.pageConfig.classList.add("hidden")
        this.pageNAlpha.classList.remove("hidden")
    }

    /**
     * Handles Config button event.
     * @private
     */
    onConfig(event) {
        this.pageAlpha.classList.add("hidden")
        this.pageNAlpha.classList.add("hidden")
        this.pageConfig.classList.remove("hidden")
    }

    /**
     * Handles key up events.
     * @private
     */
    onkeyup(event) {
        event.preventDefault()
    }

    /**
     * Handles key press events.
     * @private
     */
    onkeypress(event) {
        this.kShift = event.shiftKey
        this.keypress(this.toMinitel(event.key))
        event.preventDefault()
    }

    /**
     * Handles click events.
     * @private
     */
    onclick(event, param) {
        this.simulator.pressKey(param)

        if(param === "Maj") {
            this.kShift = !this.kShift
        }

        this.keypress(this.toMinitel(param))
    }

    /**
     * Set the uppercase mode of the keyboard
     * @param {boolean} bool true indicates the keyboard operates in uppercase
     *                       false indicates the keyboard operates in lowercase
     */
    setUppercaseMode(bool) {
        this.kUppercase = bool
    }

    /**
     * Set the extended mode of the keyboard
     * @param {boolean} bool true indicates the keyboard works extended
     *                       false indicates the keyboard works standard
     */
    setExtendedMode(bool) {
        this.kExtended = bool
    }

    /**
     * Set the cursor keys of the keyboard
     * @param {boolean} bool true indicates keyboard use cursor keys
     *                       false indicates keyboard does not use cursor keys
     */
    setCursorKeys(bool) {
        this.kCursorKeys = bool
    }

    /**
     * Converts a key to a Minitel code sequence according to the current state
     * of the keyboard.
     * @param {String} key A string identifying a key.
     * @return {Int[]} The Minitel code sequence corresponding or null if the
     *                 key cannot be converted.
     */
    toMinitel(key) {
        if(key.length == 1) {
            // Handles uppercase mode and shift key
            if(this.kUppercase == !this.kShift) {
                key = key.toUpperCase()
            } else {
                key = key.toLowerCase()
            }
        } else {
            if(key in Minitel.pcToMinitelKeys) {
                key = Minitel.pcToMinitelKeys[key]
            }
        }

        if(key in Minitel.keys["Videotex"]) {
            return Minitel.keys["Videotex"][key]
        }

        return null
    }
}
