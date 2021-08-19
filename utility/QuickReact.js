// Required for the vscode extension
const vscode = require('vscode');

const {NaryTree} = require('./NaryTree');
const fs = require('fs');
const path = require('path');
var AdmZip = require('adm-zip');


/**
 * @classdesc Quick-React elements are an object type where each element has an assigned type, name, and a 
 * set of unique key/value attributes stored as a JavaScript Map data structure.
 * @class
 */
class QuickReactElement {

    /**
     * The QuickReactElement class object constructor method
     * @constructor
     * @param {string} name - a name for this element
     * @param {string} type - a type to categorize this element 
     * @param {Object} attributes object - a shallow object containing [key, value] pairs 
     */
    constructor(name, type, attributes) {
        if ( (name===undefined) || (name===null) ) {
            throw TypeError('Quick-React Elements must be instantiated with a name and type.')
        }
        if ( (type===undefined) || (type===null) ) {
            throw TypeError('Quick-React Elements must be instantiated with a name and type.')
        }
        this._name=name;
        this._type=type;
        this._subtype="";
        this._attributes=new Map();

        if ( (attributes!==undefined) ) {
            if (typeof attributes !== 'object') {
                throw TypeError('Quick-React Element attributes must be submitted as a shallow object containing key, value pairs.');
            }

            for (const [key, value] of Object.entries(attributes)) {
                this._attributes.set(key, value);
            }
        }
    }

    /**
     * Get this element's designated type.
     * @method
     * @returns {string} - this element's designated type
     */
    get type() {
        return this._type;
    }

    /**
     * Set this element's type value
     * @method
     * @param {string} typeValue string - the element's type value 
     */
    set type(typeValue) {
        this._type=typeValue;
    }

    /**
     * Get this element's subtype value
     * @method
     * @returns {string} this element's designated subtype
     */
    get subtype() {
        return this._subtype;
    }

    /**
     * Set this element's subtype value
     * @method
     * @param {string} subtypeValue string - the element's subtype value 
     */
    set subtype(subtypeValue) {
        this._subtype=subtypeValue;
    }

    /**
     * Get the element's name.
     * @method
     * @returns {string} this element's name
     */
    get name() {
        return this._name;
    }

    /**
     * Set this element's name.
     * @method
     * @param {string} nameValue string - the element's name 
     */    
    set name(nameValue) {
        this._name=nameValue;
    }

    /**
     * Check to see if the Quick-React element has a specific attribute set
     * @method
     * @param {string} key string - check to see whether this element has an attribute with the specified property key 
     * @returns {boolean} does this Quick-React element have this attribute?
     */
    hasAttribute(key) {
        return this._attributes.has(key);
    }

    /**
     * Safely Check to see if the Quick-React element has a specific attribute key set to a specific value
     * This method does not return undefined for undefined properties, it always returns a boolean true or false value
     * @method
     * @param {Object} obj object - check to see whether this element has an attribute with the specified property key and value, submitted as a shallow object
     * @returns {boolean} does this Quick-React element have this attribute key and value?
    */
    safeHasAttribute(obj) {
        const [key, value] = Object.entries(obj)[0];

        if (this._attributes.has(key)) {
            if (this._attributes.get(key)===value) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }

    /**
     * Returns the number of attributes this element has
     * @method
     * @returns {number} the number of attributes this element has
     */
    getAttributeSize() {
        return  this._attributes.size;
    }

    /**
     * Get an attribute's value specified by the key parameter
     * @method
     * @param {string} key string - the string representing the attribute property to search for
     * @returns {string} value string - the value associated with the specified key
     */
    getAttribute(key) {
        return this._attributes.get(key);
    }

    /**
     * Delete an attribute specified by the key parameter
     * @method
     * @param {string} key string - the string representing the attribute property to delete
     * @returns {boolean} true or false return value depending on whether the delete request was successfully processed
    */
    deleteAttribute(key) {
        return this._attributes.delete(key);
    }

    /**
     * Set a key value pair as an attribute of this element
     * @method
     * @param {Object} obj {key:value} object to be set as a new attribute of this element or to replace an existing attribute with the same key
     * @returns {Object} map object - attribute map object is returned 
     */
    setAttribute( obj ) {
        const [key,value] = Object.entries(obj)[0];
        return this._attributes.set(key, value);
    }

    /**
     * Returns all key/value pairs as an array using the spread operator
     * @method
     * @returns {array[]} returns all key/value pairs as an array using the spread operator
     */
    getAllAttributes() {
        return([...this._attributes]);
    }

    /**
     * Returns the name of this element
     * @method
     * @returns {string} returns the name of this element
     */    
    toString() {
        return `${this._name} ${this._attributes}`;
    }

}

/**
 * @classdesc The QuickReact class methods perform all the processing of parsing Quick-React markup into an 
 * n-ary tree, which can then be output as React folder and file components for quick React project setup
 * @class
 */

class QuickReact {

    /**
     * Instantiates a QuickReact object and an empty n-ary tree as a JavaScript object
     * @constructor
     */
    constructor() {
        this._tree=new NaryTree();
    }

    /**
     * Retrieve a reference to this NaryTree
     * @returns {Object} NaryTree object associated with this QuickReact object
     */
    get tree() {
        return this._tree;
    }

    /**
     * The parseMarkup method takes submitted Quick-React JSX markup code and produces an n-Ary tree structure representing the components, their nested
     * structure, and each element's attributes.
     * @param {string} code string - Quick-Start markup code in text JSX format 
     * @returns {Object} returns a populated NaryTree object representing the lexed and parsed output of the supplied Quick-React markup code
     */
    parseMarkup(code) {
        if ( (code===undefined) || (code===null) || (typeof code !== 'string') ) {
            return this._tree;
        }

        let i=0;
        let j=0;
        let codeIndex=0;
        let startIndex=0;
        let endIndex=0;
        let tokenIndex=0;
        let end=code.length;
        let inComponent=false;
        let selfClosing=false;
        let configComponent=false;
        let openComponent=false;
        let closeComponent=false;

        let component = "";
        let normalizedComponent = "";

        let currentComponentNode = {};
        let parentComponentNode = {};
        let childComponentNode = {};

        let currentQuickReactElement = {};
        let parentQuickReactElement = {};
        let childQuickReactElement = {};

        let quickReactElementStack = [];
        const quickreactElementArray = [];

        // console.log(code);

        // First we will lex the markup and parse it into quick-react object elements
        outer: while (codeIndex<end) {
                if (!inComponent) {
                startIndex=code.indexOf('<', codeIndex);
                endIndex=code.indexOf('>', codeIndex);

                if ( (startIndex===-1) && (endIndex===-1) ) {
                    break outer;
                }

                if (startIndex===-1) {
                    throw new SyntaxError(`The markup code is missing an opening '<' character.  ${this._printRef(code, codeIndex, 80)}`);
                }
                if (endIndex===-1) {
                    throw new SyntaxError(`The markup code is missing a closing '>' character. ${this._printRef(code, startIndex, 80)} `);
                }

                // If this is a JSX empty enclosing component <> or </>, ignore them
                if (code.charAt(startIndex+1)==='>') {
                    codeIndex=codeIndex+2;
                    continue;
                }                
                else if ( (code.charAt(startIndex+1)==='/') && (code.charAt(startIndex+2)==='>') ) {
                    codeIndex=codeIndex+3;
                    continue;
                }           

                // Is this a close tag for a component opening tag/closing tag pair?
                if (code.charAt(startIndex+1)==='/') {
                    closeComponent=true;
                    openComponent=false;
                }
                // If it isn't a closing tag it is an opening tag.
                else {
                    closeComponent=false;
                    openComponent=true;
                }
                // Is this a single self-closing component tag?
                if (code.charAt(endIndex-1)==='/') {
                    selfClosing=true;
                    endIndex=endIndex-1;
                } 
                // This is not a self-closing component tag.
                else {
                    selfClosing=false;
                }
                inComponent=true;

                // Select the name and attributes for the is component from the input string
                component = code.slice(startIndex+1, endIndex);

                // Remove spaces around comma separated lists so split lexical tokenization can work better
                let regex = /\s+,\s+|\s+,|,\s+/g
                normalizedComponent = component.replace(regex, ',');
                component=normalizedComponent;
                // Remove single and double quotes around component attributes to ease further lexing and  subsequent parsing
                regex = /\'|\"/g
                normalizedComponent = component.replace(regex, '');
                component=normalizedComponent;
                // Inside components collapse multiple spaces into a single space
                regex = /\s+/g
                normalizedComponent = component.replace(regex, ' ');
                component=normalizedComponent;
                // Trim leading and trailing spaces from the component
                normalizedComponent = component.trim();
                component=normalizedComponent;

                const componentAttributes = component.split(' ');
                
                tokenIndex=0;
                currentQuickReactElement=new QuickReactElement('', '');

                for (let attribute of componentAttributes) {
                    if (tokenIndex===0) {
                        if (attribute==='Config') {
                            currentQuickReactElement.name='Config';
                            currentQuickReactElement.type='config';
                            configComponent=true;

                            if (selfClosing) currentQuickReactElement.subtype='selfclosingtag';
                            else if (openComponent) currentQuickReactElement.subtype='opentag';
                            else if (closeComponent) currentQuickReactElement.subtype='closetag';                            
                        }
                        else {
                            configComponent=false;
                            currentQuickReactElement.name=attribute;
                            currentQuickReactElement.type='component';

                            if (selfClosing) currentQuickReactElement.subtype='selfclosingtag';
                            else if (openComponent) currentQuickReactElement.subtype='opentag';
                            else if (closeComponent) currentQuickReactElement.subtype='closetag';
                        }
                    }
                    else {
                        // Now we will parse the individual attributes in the component tag and try to establish key/value pairs

                        if (attribute==='bootstrap')                currentQuickReactElement.setAttribute( {'react-bootstrap': true} );
                        if (attribute==='bootstrap=true')           currentQuickReactElement.setAttribute( {'react-bootstrap': true} );
                        if (attribute==='reactbootstrap')           currentQuickReactElement.setAttribute( {'react-bootstrap': true} );
                        if (attribute==='reactbootstrap=true')      currentQuickReactElement.setAttribute( {'react-bootstrap': true} );
                        if (attribute==='react-bootstrap')          currentQuickReactElement.setAttribute( {'react-bootstrap': true} );
                        if (attribute==='react-bootstrap=true')     currentQuickReactElement.setAttribute( {'react-bootstrap': true} );
                        
                        if (attribute==='fetch')                    currentQuickReactElement.setAttribute( {'fetch': true} );
                        if (attribute==='fetch=true')               currentQuickReactElement.setAttribute( {'fetch': true} );
                        if (attribute==='fetch=GET')                currentQuickReactElement.setAttribute( {'fetch': "GET"} );
                        if (attribute==='fetch=POST')               currentQuickReactElement.setAttribute( {'fetch': "POST"} );
                        if (attribute==='fetch=PUT')                currentQuickReactElement.setAttribute( {'fetch': "PUT"} );
                        if (attribute==='fetch=DELETE')             currentQuickReactElement.setAttribute( {'fetch': "DELETE"} );
                        if (attribute==='fetch=PATCH')              currentQuickReactElement.setAttribute( {'fetch': "PATCH"} );
                        if (attribute==='fetch=get')                currentQuickReactElement.setAttribute( {'fetch': "GET"} );
                        if (attribute==='fetch=post')               currentQuickReactElement.setAttribute( {'fetch': "POST"} );
                        if (attribute==='fetch=put')                currentQuickReactElement.setAttribute( {'fetch': "PUT"} );
                        if (attribute==='fetch=delete')             currentQuickReactElement.setAttribute( {'fetch': "DELETE"} );
                        if (attribute==='fetch=patch')              currentQuickReactElement.setAttribute( {'fetch': "PATCH"} );

                        if (attribute==='link')                     currentQuickReactElement.setAttribute( {'link': true} );
                        if (attribute==='link=true')                currentQuickReactElement.setAttribute( {'link': true} );

                        if (attribute==='switch')                   currentQuickReactElement.setAttribute( {'switch': true} );
                        if (attribute==='switch=true')              currentQuickReactElement.setAttribute( {'switch': true} );

                        if (attribute==='route')                    currentQuickReactElement.setAttribute( {'route': true} );
                        if (attribute==='route=true')               currentQuickReactElement.setAttribute( {'route': true} );

                        if (attribute==='router')                    currentQuickReactElement.setAttribute( {'router': true} );
                        if (attribute==='router=true')               currentQuickReactElement.setAttribute( {'router': true} );

                        if (attribute==='map')                      currentQuickReactElement.setAttribute( {'map': true} );
                        if (attribute==='map=true')                 currentQuickReactElement.setAttribute( {'map': true} );

                        if (attribute==='form')                     currentQuickReactElement.setAttribute( {'form': true} );
                        if (attribute==='form=true')                currentQuickReactElement.setAttribute( {'form': true} );

                        if (attribute.startsWith('forminput=')) {
                            if (currentQuickReactElement.hasAttribute('forminputs')) {
                                const combinedValue=`${currentQuickReactElement.getAttribute('forminputs')},${attribute.slice(10)}`;
                                currentQuickReactElement.setAttribute( {'forminputs': combinedValue} );
                            }
                            else {
                                currentQuickReactElement.setAttribute( {'forminputs': attribute.slice(10) } );
                            }
                        }
                        if (attribute.startsWith('forminputs=')) {
                            if (currentQuickReactElement.hasAttribute('forminputs')) {
                                const combinedValue=`${currentQuickReactElement.getAttribute('forminputs')},${attribute.slice(11)}`;
                                currentQuickReactElement.setAttribute( {'forminputs': combinedValue} );
                            }
                            else {
                                currentQuickReactElement.setAttribute( {'forminputs': attribute.slice(11) } );
                            }
                        }

                        if (attribute.startsWith('forminput=')) {
                            if (currentQuickReactElement.hasAttribute('forminputs')) {
                                const combinedValue=`${currentQuickReactElement.getAttribute('forminputs')},${attribute.slice(5)}`;
                                currentQuickReactElement.setAttribute( {'forminputs': combinedValue} );
                            }
                            else {
                                currentQuickReactElement.setAttribute( {'forminputs': attribute.slice(5) } );
                            }
                        }
                        if (attribute.startsWith('hooks=')) {
                            if (currentQuickReactElement.hasAttribute('hooks')) {
                                const combinedValue=`${currentQuickReactElement.getAttribute('hooks')},${attribute.slice(6)}`;
                                currentQuickReactElement.setAttribute( {'hooks': combinedValue} );
                            }
                            else {
                                currentQuickReactElement.setAttribute( {'hooks': attribute.slice(6) } );
                            }
                        }
                        if ( (attribute===('useEffect')) || (attribute===('useEffect=true')) ) {
                            if (currentQuickReactElement.hasAttribute('hooks')) {
                                const combinedValue=`${currentQuickReactElement.getAttribute('hooks')},useEffect`;
                                currentQuickReactElement.setAttribute( {'hooks': combinedValue} );
                            }
                            else {
                                currentQuickReactElement.setAttribute( {'hooks': 'useEffect'} );
                            }
                        }
                        if ( (attribute===('useState')) || (attribute===('useState=true')) ) {
                            if (currentQuickReactElement.hasAttribute('hooks')) {
                                const combinedValue=`${currentQuickReactElement.getAttribute('hooks')},useState`;
                                currentQuickReactElement.setAttribute( {'hooks': combinedValue} );
                            }
                            else {
                                currentQuickReactElement.setAttribute( {'hooks': 'useState'} );
                            }
                        }
                        if ( (attribute===('useReducer')) || (attribute===('useReducer=true')) ) {
                            if (currentQuickReactElement.hasAttribute('hooks')) {
                                const combinedValue=`${currentQuickReactElement.getAttribute('hooks')},useReducer`;
                                currentQuickReactElement.setAttribute( {'hooks': combinedValue} );
                            }
                            else {
                                currentQuickReactElement.setAttribute( {'hooks': 'useReducer'} );
                            }
                        }
                        if ( (attribute===('useContext')) || (attribute===('useContext=true')) ) {
                            if (currentQuickReactElement.hasAttribute('hooks')) {
                                const combinedValue=`${currentQuickReactElement.getAttribute('hooks')},useContext`;
                                currentQuickReactElement.setAttribute( {'hooks': combinedValue} );
                            }
                            else {
                                currentQuickReactElement.setAttribute( {'hooks': 'useContext'} );
                            }
                        }
                        if ( (attribute===('useLocation')) || (attribute===('useLocation=true')) ) {
                            if (currentQuickReactElement.hasAttribute('hooks')) {
                                const combinedValue=`${currentQuickReactElement.getAttribute('hooks')},useLocation`;
                                currentQuickReactElement.setAttribute( {'hooks': combinedValue} );
                            }
                            else {
                                currentQuickReactElement.setAttribute( {'hooks': 'useLocation'} );
                            }
                        }
                        if ( (attribute===('useHistory')) || (attribute===('useHistory=true')) ) {
                            if (currentQuickReactElement.hasAttribute('hooks')) {
                                const combinedValue=`${currentQuickReactElement.getAttribute('hooks')},useHistory`;
                                currentQuickReactElement.setAttribute( {'hooks': combinedValue} );
                            }
                            else {
                                currentQuickReactElement.setAttribute( {'hooks': 'useHistory'} );
                            }
                        }                                                
                        if ( (attribute===('useParams')) || (attribute===('useParams=true')) ) {
                            if (currentQuickReactElement.hasAttribute('hooks')) {
                                const combinedValue=`${currentQuickReactElement.getAttribute('hooks')},useParams`;
                                currentQuickReactElement.setAttribute( {'hooks': combinedValue} );
                            }
                            else {
                                currentQuickReactElement.setAttribute( {'hooks': 'useParams'} );
                            }
                        }                                                

                        if ( (attribute.startsWith('useEffect*')) || 
                             (attribute.startsWith('useState*')) || 
                             (attribute.startsWith('useReducer*')) || 
                             (attribute.startsWith('useContext*')) ) {
                            if (currentQuickReactElement.hasAttribute('hooks')) {
                                const combinedValue=`${currentQuickReactElement.getAttribute('hooks')},${attribute}`;
                                currentQuickReactElement.setAttribute( {'hooks': combinedValue} );
                            }
                            else {
                                currentQuickReactElement.setAttribute( {'hooks': attribute} );
                            }
                        }

                    }

                    // console.log(`attribute[${tokenIndex}]=${attribute}`);
                    tokenIndex++;
                }

                quickreactElementArray.push(currentQuickReactElement);

                if (selfClosing) codeIndex=endIndex+2;
                else codeIndex=endIndex+1;
                
                inComponent=false;
                selfClosing=false;
            }
            codeIndex++;
        }

        // Now that we have all of the quick-react elements in an array, we will construct our n-ary tree based on the nested structure of the component tags
        // A "Config" configuration Quick-React element object will be stored in our root node
        let hasConfig=false;
        for (let i=0; i<quickreactElementArray.length; i++) {
            if (quickreactElementArray[i].type==="config") {
                this._tree.add(quickreactElementArray[i]);
                quickReactElementStack.push(quickreactElementArray[i]);
                hasConfig=true;
            }
        }
        if (!hasConfig) {
            currentQuickReactElement=new QuickReactElement('', '');
            currentQuickReactElement.name='Config';
            currentQuickReactElement.type='config';    
            this._tree.add(currentQuickReactElement);       
            quickReactElementStack.push(quickreactElementArray[i]);
        }

        // All markup files must include an overall <App> tag and </App> tag.
        let hasApp=false;
        for (let i=0; i<quickreactElementArray.length; i++) {
            if ( (quickreactElementArray[i].name==="App") && (quickreactElementArray[i].subtype==="opentag") ) {
                hasApp=true;
                this._tree.addAsFirstChild(quickreactElementArray[i], this._tree.root);
                quickReactElementStack.push(quickreactElementArray[i])                
            }
        }
        if (!hasApp) {
            throw new SyntaxError(`The markup code must include an opening <App> component tag and closing </App> tag.`);
        }


        // for (let i=0; i<quickreactElementArray.length; i++) {
        // console.log(`${quickreactElementArray[i].name} ${quickreactElementArray[i].type} ${quickreactElementArray[i].subtype} `);
        // }

        // Every tag that isn't self closing must include a closing tag somewhere in the markup
        for (let i=0; i<quickreactElementArray.length; i++) {

            if ( (quickreactElementArray[i].type==="component") && (quickreactElementArray[i].subtype==="opentag") ) {
                // We have located an opentag, now let's check for its matching closing tag
                let hasClosingTag=false;
                for (let j=0; j<quickreactElementArray.length; j++) {
                    if (quickreactElementArray[j].name===`/${quickreactElementArray[i].name}`) {
                        if ( (quickreactElementArray[j].type==="component") && (quickreactElementArray[j].subtype==="closetag") ) {
                            hasClosingTag=true;
                        }
                    }
                }
                if (!hasClosingTag) {
                    throw new SyntaxError(`All components in the Quick-React markup, which are not self-closing, must include a matching closing tag.  Please include a closing tag: </${quickreactElementArray[i].name}> for the ${quickreactElementArray[i].name} component.`);
                }
            }
        }



        // Next we will fill in our n-ary tree data structure 
        for (let i=0; i<quickreactElementArray.length; i++) {

            // console.log(`${i} ${quickreactElementArray[i].name} ${quickreactElementArray[i].type} ${quickreactElementArray[i].subtype}`);

            if ( (quickreactElementArray[i].type==="component") && (quickreactElementArray[i].subtype==="opentag") ) {
                parentQuickReactElement=quickReactElementStack.pop();
                parentComponentNode=this._tree.getNode(parentQuickReactElement);
                quickReactElementStack.push(parentQuickReactElement);
                quickReactElementStack.push(quickreactElementArray[i]);
                if (parentComponentNode.value!==quickreactElementArray[i]) {
                    this._tree.addAsLastChild(quickreactElementArray[i], parentComponentNode);
                }
            }
            else if ( (quickreactElementArray[i].type==="component") && (quickreactElementArray[i].subtype==="selfclosingtag") ) {
                parentQuickReactElement=quickReactElementStack.pop();
                parentComponentNode=this._tree.getNode(parentQuickReactElement);
                quickReactElementStack.push(parentQuickReactElement);
                this._tree.addAsLastChild(quickreactElementArray[i], parentComponentNode);
            }
            else if ( (quickreactElementArray[i].type==="component") && (quickreactElementArray[i].subtype==="closetag") ) {
                parentQuickReactElement=quickReactElementStack.pop();
                if (`/${parentQuickReactElement.name}`!==quickreactElementArray[i].name) {
                    throw new SyntaxError(`Opening and closing tags for different components can not overlap.  Please check the placement of the following tags: <${parentQuickReactElement.name}> <${quickreactElementArray[i].name}>.`);
                }            
            }
        }

        return this._tree;
    }

    /**
     * This function prints a strings from the current code index to a specified length to provide the developer/user
     * with a reference as to where their code may have a syntax error.
     * @method
     * @param {string} code - the Quick-React markup code
     * @param {number} index - the character position in the code where an error was found
     * @param {number} length - the length is characters of surrounding context text to display in the response message
     * @returns {string} message - a message regarding the error or problem found in the supplied code
     */
    _printRef(code, index, length) {
        return `Reference: ${code.slice(index, index+length)}`
    }

    /**
     * The _multiplier function checks the passed attribute and determines whether a multiplier 
     * expression is used in the attribute, denoted by an '*', to request a repeat of the item a specified number of times.
     * Multiplier values can be a single integer digit or two integer digits long.
     * @method
     * @param {string} attribute string - the attribute key to search for
     * @returns {number} returns the multiplier value found in the attribute or 1 as a default
     */
    _multiplier(attribute) {
        if ( (attribute.length>=4) && (attribute.charAt(attribute.length-3)==='*') && (!isNaN(parseInt(attribute.slice(-2))))  ) {
            const num=(parseInt(attribute.slice(-2)));
            return num;
        }
        else if ( (attribute.length>=3) && (attribute.charAt(attribute.length-2)==='*') && (!isNaN(parseInt(attribute.slice(-1))))  ) {
            const num=(parseInt(attribute.slice(-1)));
            return num;
        }
        else {
            return 1;
        }
    }

    /**
      * This is the same as the _multiplier function except that it looks through all of the component's attributes for
      * the first matching attribute, compared via key name, and then checks to see if a multiplier expression is used.
      * @method
      * @param {Object} component quickReactElement component - a Quick-React object element to search
      * @param {string} searchAttribute - the attribute to search for in the element
      * @param {array[]} specifiedNameArray - an array used to hold values of requested field/variable names in the markup
      * @param {string} defaultName - a default name to use for a field/variable if specified names are used in the markup
      * @param {number} matchIndex - add support for use of an attribute more than one time in a single component
      * @returns {number} returns the multiplier value found or zero if the attribute wasn't found, or one if the attribute was found but no multiplier was specified
      */
    _findMultiplier(component, searchAttribute, specifiedNameArray, defaultName, matchIndex) {

        const attributes = component.getAllAttributes(component);
        let attribute = "";
        if (attributes.length<=0) {
            return 0;
        }

        for (let [key, value] of attributes) {
            let regex = new RegExp(`${searchAttribute}\\*\\d{2}|${searchAttribute}\\*\\d{1}|${searchAttribute}\\[.+?\\]|^${searchAttribute}$|${searchAttribute}[\s\t,;]|[\s\t,;]${searchAttribute}[\s\t,;]|[\s\t,;]${searchAttribute}$`, 'g');
            if ( (value!==undefined) && (value!==null) && (typeof value==='string') ) {
                const matches = value.match(regex);    
                if ( (matches!=null) && (matchIndex<matches.length) && (matches[matchIndex]!==null) && (matches[matchIndex].length>0) ) {
                    attribute = matches[matchIndex];
                    break;
                }
            }
        }

        if (attribute==='') {
            return 0;
        }

        // If the user has supplied a list of field name values inside of square brackets, parse out those values, and store them into an array
        if ( (attribute.indexOf('[')!==-1) && (attribute.indexOf(']')!==-1) ) {

            // Grab the value between the square brackets
            const fieldNameList=attribute.slice(attribute.indexOf('[')+1,attribute.lastIndexOf(']'));

            // If it is a comma separated list, split it into individual array elements and reference the values using the 
            // specifiedNameArray method parameter
            const fieldNameArray=fieldNameList.split(',');

            if (fieldNameArray.length===0) {
                return 0;
            }

            // Trim out any starting or trailing whitespace, although there shouldn't be any at this point
            for (let i=0; i<fieldNameArray.length; i++) {
                specifiedNameArray[i]=[];
                specifiedNameArray[i]['default']=fieldNameArray[i].trim();
                specifiedNameArray[i]['lower']=specifiedNameArray[i]['default'].toLowerCase();
                specifiedNameArray[i]['mixed']=specifiedNameArray[i]['lower'][0].toUpperCase()+specifiedNameArray[i]['lower'].slice(1);
            }

            // Return the length of the array as if it was specified as a field multiplier
            return specifiedNameArray.length;
        }
        
        let num=1;
            if ( (attribute.length>=4) && (attribute.charAt(attribute.length-3)==='*') && (!isNaN(parseInt(attribute.slice(-2))))  ) {
            num=(parseInt(attribute.slice(-2)));
        }
        else if ( (attribute.length>=3) && (attribute.charAt(attribute.length-2)==='*') && (!isNaN(parseInt(attribute.slice(-1))))  ) {
            num=(parseInt(attribute.slice(-1)));
        }
        else {
            num=1;
        }

        for (let i=0; i<num; i++) {
            specifiedNameArray[i]=[];
            specifiedNameArray[i]['default']=''+defaultName.trim()+(i+1);
            specifiedNameArray[i]['lower']=specifiedNameArray[i]['default'].toLowerCase();
            specifiedNameArray[i]['mixed']=specifiedNameArray[i]['lower'][0].toUpperCase()+specifiedNameArray[i]['lower'].slice(1);
        }        

        return num;        
    }


    /*==========================================================================================*/

    /**
     * A function to generate React directories and files based on the n-Ary tree representation of the Quick-React markup
     * @method
     * @param {Object} tree NaryTree tree - The tree of parsed values representing the structure of this Quick-React project
     * @returns {undefined} Stores the directories and files for the project and generates a zip file with all of the content archived into a single downloadable document.
     */
     generateProjectFiles(tree) {

        if ( (tree===undefined) || !(tree instanceof NaryTree) ) {
            return;
        }

        // First, check for important global configuration settings, like whether to use bootstrap
        let quickReactElement = {};
        let useBootstrap=false;
        quickReactElement = tree.getByObjectProperty( {'_name':'Config'} );
        if (quickReactElement.hasAttribute('react-bootstrap')) {
            useBootstrap=quickReactElement.getAttribute('react-bootstrap');
        }

        const fileUri = vscode.window.activeTextEditor.document.uri;
        const folderPath = path.dirname(fileUri.path);

        const projectDirectory = folderPath;      
        const componentsDirectory = path.join(folderPath, "components")
        const imagesDirectory = path.join(folderPath, "images")
        const assetsDirectory = path.join(folderPath, "assets")

        // console.log(userDirectory);
        // console.log(zipDirectory);
        // console.log(zipFilepath);
        // console.log(projectDirectory);
        // console.log(componentsDirectory);
        // console.log(imagesDirectory);
        // console.log(assetsDirectory);
 
        let existsFlag=false;

        try {
            if (!fs.existsSync(componentsDirectory)) {
                fs.mkdirSync(componentsDirectory);
            }
            else {
                existsFlag=true;
            }
            if (!fs.existsSync(imagesDirectory)) {
                fs.mkdirSync(imagesDirectory);
            }
            else {
                existsFlag=true;
            }
            if (!fs.existsSync(assetsDirectory)) {
                fs.mkdirSync(assetsDirectory);
            }
            else {
                existsFlag=true;
            }

            let checkFilepath = "";
            checkFilepath = path.join(projectDirectory, 'index_qr.js');
            if (fs.existsSync(checkFilepath )) {
                existsFlag=true;
            }
            checkFilepath  = path.join(projectDirectory, 'App_qr.js');
            if (fs.existsSync(checkFilepath )) {
                existsFlag=true;
            }
        } catch (error) {
            // console.log(error);
            // Rethrow the error back up the call stack
            throw(error); 
        }

        // If confirmed to proceed, we will iterate through the entire n-ary tree, representing our Quick-React project and create folders, 
        // files, and settings component-by-component.  The files will be generated sequentially in level-order order.
        const _handleFileGeneration = () => {

            const treeIterator = tree.levelOrderIterator(tree.root);

        for (let node of treeIterator) {

            const quickReactElement = node.value;
            let document = "";

            // Process the config node as index.js
            if ( quickReactElement.name==='Config') {
                // Use the config node as an opportunity to create an index_qr.js file
                document = "";
                document = document + output_index(useBootstrap, this, tree, quickReactElement, node);     
                
                let indexFilepath = path.join(projectDirectory, 'index_qr.js');

                try {
                    const data = fs.writeFileSync(indexFilepath, document);
                    // file written successfully
                  } catch (error) {
                    console.error(error)
                  }
            }
            else if ( quickReactElement.name==='App') {
                document = "";
                document = document + output_app(useBootstrap, this, tree, quickReactElement, node);                 

                let appFilepath = path.join(projectDirectory, 'App_qr.js')

                try {
                    const data = fs.writeFileSync(appFilepath, document);
                    // file written successfully
                  } catch (error) {
                    console.error(error)
                  }
            }
            else if ( quickReactElement.type==='component') {
                document = "";
                document = document + output_component(useBootstrap, this, tree, quickReactElement, node);      

                let componentDirectory = path.join(projectDirectory, 'components', `${quickReactElement.name}`);
                
                try {
                    if (!fs.existsSync(componentDirectory)) {
                        fs.mkdirSync(componentDirectory);
                    }        
                } catch (error) {
                    // console.log(error);
                    // Rethrow the error back up the call stack
                    throw(error);
                }
        
                let componentFilepath = path.join(projectDirectory, 'components', `${quickReactElement.name}`, 'index.js');

                try {
                    const data = fs.writeFileSync(componentFilepath, document);
                    // file written successfully
                } catch (error) {
                    // console.error(error);
                    // Rethrow the error back up the call stack
                    throw(error);                    
                }                  

            }
        }
        vscode.window.showInformationMessage('Your Quick-React project directories and files have been successfully created or updated.');
    }

    // Before proceeding, let's see if we need to confirm file overwriting based on user preference settings
    if (existsFlag===true) {
        let qrcConfiguration = {};
        qrcConfiguration = vscode.workspace.getConfiguration().get('quickReact.files.confirmOverwrite');
    
        // Ask user to confirm overwrites if necessary 
        if ( (qrcConfiguration!==undefined) && (qrcConfiguration===true) ) {
            vscode.window.showInformationMessage('Proceeding will overwrite any matching existing Quick-React React component files.  Proceed?', 'Proceed', 'Cancel', 'Always Proceed').then( (confirmation) =>  {
                if (confirmation==='Proceed') {
                    _handleFileGeneration();
                    return;
                }
                else if (confirmation==='Cancel') {
                    return;
                }
                else if (confirmation==='Always Proceed') {
                    vscode.workspace.getConfiguration().update('quickReact.files.confirmOverwrite', false, vscode.ConfigurationTarget.Global).then( () => {
                        _handleFileGeneration();
                        return;
                    });
                }
            });
        }
        else {
            _handleFileGeneration();
            return;
        }
    }    
        
}

}


/*================================================================================================*/
/*================================================================================================*/
/*================================================================================================*/

/**
 * Output the index.js file as index_qr.js for this React project
 * @method
 * @param {boolean} useBootstrap boolean - boolean flag indicating whether react-bootstrap should be used
 * @param {Object} quickReact object - the instance of the Quick-React project object
 * @param {Object} tree NaryTree tree object - the parse tree of object and values for this project
 * @param {Object} quickReactElement QuickReactElement object - a specific quickReactElement
 * @param {Object} node NaryNode node object - a specific node in the project tree
 * @returns {string} Outputs the content for the index.js file as index_qr.js for this React project
 */
function output_index(useBootstrap, quickReact, tree, quickReactElement, node) {

let output = "";

output = output + 
`import React from 'react';
import ReactDOM from 'react-dom';
`;

if (quickReactElement.safeHasAttribute( {'router': true} )) {
output = output + 
`import { BrowserRouter as Router } from 'react-router-dom';
`;
}

if (useBootstrap) {
output = output + 
`import 'bootstrap/dist/css/bootstrap.min.css';
`;
}

output = output + 
`import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
`;

if (quickReactElement.safeHasAttribute( {'router': true} )) {
output = output + 
`ReactDOM.render(
<Router>
    <React.StrictMode>
        <App />
    </React.StrictMode>
</Router>,
document.getElementById('root')
);

reportWebVitals();
`;
}
else {
output = output + 
`ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
document.getElementById('root')
);

reportWebVitals();
`;
}

return output;

}


/*================================================================================================*/
/*================================================================================================*/
/*================================================================================================*/

/**
 * Output the App.js file as App_qr.js for this React project
 * @method
 * @param {boolean} useBootstrap boolean - boolean flag indicating whether react-bootstrap should be used
 * @param {Object} quickReact object - the instance of the Quick-React project object
 * @param {Object} tree NaryTree tree object - the parse tree of object and values for this project
 * @param {Object} quickReactElement QuickReactElement object - a specific quickReactElement
 * @param {Object} node NaryNode node object - a specific node in the project tree
 * @returns {string} - Outputs the content for the App.js file as App_qr.js for this React project
 */
function output_app(useBootstrap, quickReact, tree, quickReactElement, node) {

let specifiedNameArray=[];
let output = "";
let matchIndex=0;

output = output + `import React from 'react';\n`;

let hooks=quickReactElement.getAttribute('hooks');
if (hooks!==undefined) {
    let hookTokenList="";
    let comma="";
    if (hooks.indexOf('useEffect')!=-1)     { hookTokenList=hookTokenList+comma+'useEffect'; comma=", "; }
    if (hooks.indexOf('useState')!=-1)      { hookTokenList=hookTokenList+comma+'useState'; comma=", "; }
    if (hooks.indexOf('useContext')!=-1)    { hookTokenList=hookTokenList+comma+'useContext'; comma=", "; }
    if (hooks.indexOf('useReducer')!=-1)    { hookTokenList=hookTokenList+comma+'useReducer'; comma=", "; }

    if (hookTokenList!=="")
    output = output + `import { ${hookTokenList} } from 'react';\n`;
}

let reactSwitch=quickReactElement.getAttribute('switch');
let reactRoute=quickReactElement.getAttribute('route');
let reactLink=quickReactElement.getAttribute('link');

if ( (hooks!==undefined) || (reactSwitch!==undefined) || (reactRoute!==undefined) || (reactLink!==undefined) ) { 
    let tokenList="";
    let comma="";
    if (hooks.indexOf('useLocation')!=-1)     { tokenList=tokenList+comma+'useLocation'; comma=", "; }
    if (hooks.indexOf('useHistory')!=-1)      { tokenList=tokenList+comma+'useHistory'; comma=", "; }
    if (hooks.indexOf('useParams')!=-1)      { tokenList=tokenList+comma+'useParams'; comma=", "; }

    if ((reactSwitch!==undefined) && (reactSwitch===true))     { tokenList=tokenList+comma+'Switch'; comma=", "; }
    if ((reactRoute!==undefined) && (reactRoute===true))     { tokenList=tokenList+comma+'Route'; comma=", "; }
    if ((reactLink!==undefined) && (reactLink===true))     { tokenList=tokenList+comma+'Link'; comma=", "; }

    if (tokenList!=="")
    output = output + `import { ${tokenList} } from "react-router-dom";\n`;
}

if (useBootstrap) {
    let useForm=quickReactElement.getAttribute('form');
    if ( (useForm!==undefined) && (useForm===true) ) {    
        output = output + `import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';\n`;
    }
    else {
        output = output + `import { Container, Row, Col } from 'react-bootstrap';\n`;
    }
}

let childrenNodes = node.children;
if (childrenNodes.length>0) {
    for (let child of childrenNodes) {
        output = output + `import { ${child.value.name} } from './components/${child.value.name}';\n`;
    }
}
output = output + `import './App.css';\n`;
output = output + `\n`;
output = output + `/*==========================================================================================*/\n`;

if ( (hooks!==undefined) && (hooks.indexOf('useContext')!=-1) )  {

    specifiedNameArray=[];
    matchIndex=0;
    while (quickReact._findMultiplier(quickReactElement, 'useContext', specifiedNameArray, 'SampleContext', matchIndex)!==0) {
        for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'useContext', specifiedNameArray, 'SampleContext', matchIndex); i++) {
            output = output + `export const ${specifiedNameArray[i].mixed} = React.createContext(); \n`;
        }
        output = output + `\n`;
        matchIndex++;
    }
}

if ( (hooks!==undefined) && (hooks.indexOf('useReducer')!=-1) ) {

    specifiedNameArray=[];
    matchIndex=0;
    while (quickReact._findMultiplier(quickReactElement, 'useReducer', specifiedNameArray, 'SampleDispatchContext', matchIndex)!==0) {
        for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'useReducer', specifiedNameArray, 'SampleDispatchContext', matchIndex); i++) {
            output = output + `export const ${specifiedNameArray[i].mixed} = React.createContext();\n`;
        }
        output = output + `\n`;
        matchIndex++;
    }
}


output = output + `
export const App = (props) => {

`;

if ( (hooks!==undefined) && (hooks.indexOf('useLocation')!=-1) )
output = output + ` const location = useLocation();\n`;

if ( (hooks!==undefined) && (hooks.indexOf('useHistory')!=-1) )
output = output + ` const history = useHistory();\n`;

if ( (hooks!==undefined) && (hooks.indexOf('useParams')!=-1) )
output = output + ` const params = useParams();\n`;

if ( (hooks!==undefined) && (hooks.indexOf('useReducer')!=-1) ) {

    specifiedNameArray=[];
    matchIndex=0;
    while (quickReact._findMultiplier(quickReactElement, 'useReducer', specifiedNameArray, 'sampleReducer', matchIndex)!==0) {
    for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'useReducer', specifiedNameArray, 'sampleReducer', matchIndex); i++) {
        output = output + `
        
        // This useReducer hook can call local functions to handle the requested actions if necessary
        function ${specifiedNameArray[i].lower}(state, action) {
            switch (action.type) {
            case 'Case1':
                return newState;
            case 'Case2':
                return newState;
            case 'Case3':
                return newState;        
            default:
                return newState;
            }
        }
        
        // sample initialState${(i+1)}
        const initialState${(i+1)} = {
            user: "",
            password: "",
            loggedin: false,
        }

        const [sampleState${(i+1)}, dispatch${(i+1)}] = useReducer(${specifiedNameArray[i].lower}, initialState${(i+1)});

        `;
    }
    matchIndex++;
    }

}

let useForm=quickReactElement.getAttribute('form');
if ( (hooks!==undefined) && (hooks.indexOf('useState')!=-1) && (useForm!==undefined) && (useForm===true) ) {

output = output + 
`    
// sample initialFormValues
const initialFormValues1 = {
    first_name: "",
    last_name: "",
    email_address: "",
}
\n`;

    specifiedNameArray=[];
    matchIndex=0;
    while (quickReact._findMultiplier(quickReactElement, 'useState', specifiedNameArray, 'formValues', matchIndex)!==0 ) {
        for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'useState', specifiedNameArray, 'formValues', matchIndex); i++) {
            output = output + `    const [formValues${(i+1)}, setFormValues${(i+1)}] = useState(initialFormValues${(i+1)});\n`;
            output = output + `    const [formError${(i+1)}, setFormError${(i+1)}] = useState(false);\n`;
            output = output + ` \n`;
        }
        matchIndex++;
    }    
}
else if ( (hooks!==undefined) && (hooks.indexOf('useState')!=-1)  ) {

    specifiedNameArray=[];
    matchIndex=0;
    while (quickReact._findMultiplier(quickReactElement, 'useState', specifiedNameArray, 'appState', matchIndex)!==0 ) {
        for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'useState', specifiedNameArray, 'appState', matchIndex); i++) {
            output = output + ` const [${specifiedNameArray[i].lower}, set${specifiedNameArray[i].mixed}] = useState({});\n`;
            output = output + ` \n`;
        }
        matchIndex++;
    }
}

if ( (hooks!==undefined) && (hooks.indexOf('useEffect')!=-1) ) {

    specifiedNameArray=[];
    matchIndex=0;
    while (quickReact._findMultiplier(quickReactElement, 'useEffect', specifiedNameArray, 'sampleEffect', matchIndex)!==0 ) {
        for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'useEffect', specifiedNameArray, 'sampleEffect', matchIndex); i++) {
        output = output + 
        `
        /*==========================================================================================*/
        // Preferred method formatting of placing async function calls inside the useEffect as an 
        // anonymous function
        useEffect( () => {    
            async function _handleGenericAsync${(i+1)}() {
                try {

                } catch(error) {
                console.error(error);
                }
            }
            _handleGenericAsync${(i+1)}();
        }
        ,[]);
        /*==========================================================================================*/
        `;

        }
        matchIndex++;
    }
}

output=output + 
`
  return (
 
    <div className="App">
`;

if ( ((hooks!==undefined) && (hooks.indexOf('useContext')!=-1)) ) {
        specifiedNameArray=[];
        matchIndex=0;
        while (quickReact._findMultiplier(quickReactElement, 'useContext', specifiedNameArray, 'SampleContext', matchIndex)!==0) {
            for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'useContext', specifiedNameArray, 'SampleContext', matchIndex); i++) {
                output = output + `    <${specifiedNameArray[i].mixed}.Provider value={sampleState${(i+1)}} > \n`;
            }
            matchIndex++;
        }
}

if ( ((hooks!==undefined) && (hooks.indexOf('useReducer')!=-1)) ) {
        specifiedNameArray=[];
        matchIndex=0;
        while (quickReact._findMultiplier(quickReactElement, 'useReducer', specifiedNameArray, 'SampleDispatchContext', matchIndex)!==0) {
            for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'useReducer', specifiedNameArray, 'SampleDispatchContext', matchIndex); i++) {
                output = output + `    <${specifiedNameArray[i].mixed}.Provider value={dispatch${(i+1)}} > \n`;
            }
            matchIndex++;
        }
}

childrenNodes = node.children;
if (childrenNodes.length>0) {
    for (let child of childrenNodes) {
        output = output + `     <${child.value.name} state={state} setState={setState} />\n`;
    }
}


if ((reactSwitch!==undefined) && (reactSwitch===true)) {
    output = output + `        <Switch>\n`;
}
if ((reactRoute!==undefined) && (reactRoute===true)) {
output = output + `
            // Sample Route Variations
            <Route path="/login" exact>
                <SampleComponent />
            </Route>
            <Route path="/logout/:id" component={SampleComponent} exact />
            <Route path="/somepath" render={routeProps => (<Component {...routeProps} />)} />
            <Route path="/home" render={() => <div>Home</div>} />
`;
}

if ((reactSwitch!==undefined) && (reactSwitch===true)) {
    output = output + `       </Switch>\n`;
}

if ((reactLink!==undefined) && (reactLink===true)) {
    output = output + `        <Link to="/">Home</Link>\n`;
}


if ( ((hooks!==undefined) && (hooks.indexOf('useReducer')!=-1)) ) {
        specifiedNameArray=[];
        matchIndex=0;
        while (quickReact._findMultiplier(quickReactElement, 'useReducer', specifiedNameArray, 'SampleDispatchContext', matchIndex)!==0) {
            for (let i=quickReact._findMultiplier(quickReactElement, 'useReducer', specifiedNameArray, 'SampleDispatchContext', matchIndex); i>0; i--) {
                output = output + `    </${specifiedNameArray[i].mixed}.Provider>\n`;
            }
            matchIndex++;
        }
}

if ( ((hooks!==undefined) && (hooks.indexOf('useContext')!=-1)) ) {
        specifiedNameArray=[];
        matchIndex=0;
        while (quickReact._findMultiplier(quickReactElement, 'useContext', specifiedNameArray, 'SampleContext', matchIndex)!==0) {
            for (let i=quickReact._findMultiplier(quickReactElement, 'useContext', specifiedNameArray, 'SampleContext', matchIndex); i>0; i--) {
                output = output + `    </${specifiedNameArray[i].mixed}.Provider>\n`;
            }
            matchIndex++;
        }
}

output=output + 
`
    </div>
  );

}

export default App;

`;

return output;

}


/*================================================================================================*/
/*================================================================================================*/
/*================================================================================================*/

/**
 * Output individual component files for the React project
 * @method
 * @param {boolean} useBootstrap boolean - boolean flag indicating whether react-bootstrap should be used
 * @param {Object} quickReact object - the instance of the Quick-React project object
 * @param {Object} tree NaryTree tree object - the parse tree of object and values for this project
 * @param {Object} quickReactElement QuickReactElement object  - a specific quickReactElement
 * @param {Object} node NaryNode node object - a specific node in the project tree
 * @returns {string}  Outputs the content for the specific component file for this React project
 */
function output_component(useBootstrap, quickReact, tree, quickReactElement, node) {

    let specifiedNameArray=[];
    let matchIndex=0;

    let output = "";
    
    output = output + `import React from 'react';\n`;
    
    let hooks=quickReactElement.getAttribute('hooks');
    if (hooks!==undefined) {
        let hookTokenList="";
        let comma="";
        if (hooks.indexOf('useEffect')!=-1)     { hookTokenList=hookTokenList+comma+'useEffect'; comma=", "; }
        if (hooks.indexOf('useState')!=-1)      { hookTokenList=hookTokenList+comma+'useState'; comma=", "; }
        if (hooks.indexOf('useContext')!=-1)    { hookTokenList=hookTokenList+comma+'useContext'; comma=", "; }
        if (hooks.indexOf('useReducer')!=-1)    { hookTokenList=hookTokenList+comma+'useReducer'; comma=", "; }
    
        if (hookTokenList!=="")
        output = output + `import { ${hookTokenList} } from 'react';\n`;

        if (hooks.indexOf('useContext')!=-1) {
            output = output + `// If you are using context exported from another parent component\n`;
            output = output + `// import { SampleContext } from '../../App';\n`;
            output = output + `// import { SampleDispatchContext } from '../../App';\n`;
        }
    }
    
    let reactSwitch=quickReactElement.getAttribute('switch');
    let reactRoute=quickReactElement.getAttribute('route');
    let reactLink=quickReactElement.getAttribute('link');
    
    if ( (hooks!==undefined) || (reactSwitch!==undefined) || (reactRoute!==undefined) || (reactLink!==undefined) ) { 
        let tokenList="";
        let comma="";
        if (hooks.indexOf('useLocation')!=-1)     { tokenList=tokenList+comma+'useLocation'; comma=", "; }
        if (hooks.indexOf('useHistory')!=-1)      { tokenList=tokenList+comma+'useHistory'; comma=", "; }
        if (hooks.indexOf('useParams')!=-1)      { tokenList=tokenList+comma+'useParams'; comma=", "; }
    
        if ((reactSwitch!==undefined) && (reactSwitch===true))     { tokenList=tokenList+comma+'Switch'; comma=", "; }
        if ((reactRoute!==undefined) && (reactRoute===true))     { tokenList=tokenList+comma+'Route'; comma=", "; }
        if ((reactLink!==undefined) && (reactLink===true))     { tokenList=tokenList+comma+'Link'; comma=", "; }
    
        if (tokenList!=="")
        output = output + `import { ${tokenList} } from "react-router-dom";\n`;
    }
    
    if (useBootstrap) {
        let useForm=quickReactElement.getAttribute('form');
        if ( (useForm!==undefined) && (useForm===true) ) {    
            output = output + `import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';\n`;
        }
        else {
            output = output + `import { Container, Row, Col } from 'react-bootstrap';\n`;
        }
    }
    
    let childrenNodes = node.children;
    if (childrenNodes.length>0) {
        for (let child of childrenNodes) {
            output = output + `import { ${child.value.name} } from '../${child.value.name}';\n`;
        }
    }
    output = output + `import './App.css';\n`;
    output = output + `\n`;
    output = output + `/*==========================================================================================*/\n`;
    
    if ( (hooks!==undefined) && (hooks.indexOf('useContext')!=-1) )  {

        specifiedNameArray=[];
        matchIndex=0;
        while (quickReact._findMultiplier(quickReactElement, 'useContext', specifiedNameArray, 'SampleContext', matchIndex)!==0) {
            for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'useContext', specifiedNameArray, 'SampleContext', matchIndex); i++) {
                output = output + `export const ${specifiedNameArray[i].mixed} = React.createContext(); \n`;
            }
            output = output + `\n`;
            matchIndex++;
        }

    }
    
    if ( (hooks!==undefined) && (hooks.indexOf('useReducer')!=-1) ) {

        specifiedNameArray=[];
        matchIndex=0;
        while (quickReact._findMultiplier(quickReactElement, 'useReducer', specifiedNameArray, 'SampleDispatchContext', matchIndex)!==0) {
            for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'useReducer', specifiedNameArray, 'SampleDispatchContext', matchIndex); i++) {
                output = output + `export const ${specifiedNameArray[i].mixed} = React.createContext();\n`;
            }
            output = output + `\n`;
            matchIndex++;
        }
    }
    
    let useForm=quickReactElement.getAttribute('form');
    let useMap=quickReactElement.getAttribute('map');

    output = output + 
`
export const ${quickReactElement.name} = (props) => {
    
\n`;
    
    if ( (hooks!==undefined) && (hooks.indexOf('useContext')!=-1) ) {
        output = output + `// If you are using context exported from another parent component\n`;
        output = output + `// const session = useContext(SampleContext);\n`;
        output = output + `// const dispatch = useContext(SampleDispatchContext);\n`;
        output = output + `\n`;
    }

    if ( (hooks!==undefined) && (hooks.indexOf('useLocation')!=-1) )
    output = output + ` const location = useLocation();\n`;
    
    if ( (hooks!==undefined) && (hooks.indexOf('useHistory')!=-1) )
    output = output + ` const history = useHistory();\n`;
    
    if ( (hooks!==undefined) && (hooks.indexOf('useParams')!=-1) )
    output = output + ` const history = useParams();\n`;

    if ( (hooks!==undefined) && (hooks.indexOf('useReducer')!=-1) ) {

        specifiedNameArray=[];
        matchIndex=0;
        while (quickReact._findMultiplier(quickReactElement, 'useReducer', specifiedNameArray, 'sampleReducer', matchIndex)!==0) {
            for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'useReducer', specifiedNameArray, 'sampleReducer', matchIndex); i++) {
            output = output + `
            
            // This useReducer hook can call local functions to handle the requested actions if necessary
            function s${specifiedNameArray[i].lower}(state, action) {
                switch (action.type) {
                case 'Case1':
                    return newState;
                case 'Case2':
                    return newState;
                case 'Case3':
                    return newState;        
                default:
                    return newState;
                }
            }
            
            // sample initialState${(i+1)}
            const initialState${(i+1)} = {
                user: "",
                password: "",
                loggedin: false,
            }
            
            const [sampleState${(i+1)}, dispatch${(i+1)}] = useReducer(${specifiedNameArray[i].lower}, initialState${(i+1)});
            
            `;
            }
            matchIndex++;
        }
    }


    if ( (hooks!==undefined) && (hooks.indexOf('useState')!=-1) && (useForm!==undefined) && (useForm===true) ) {

        output = output + 
    `    
    // sample initialFormValues
    const initialFormValues1 = {
        first_name: "",
        last_name: "",
        email_address: "",
    }
    \n`;
    
        specifiedNameArray=[];
        matchIndex=0;
        while (quickReact._findMultiplier(quickReactElement, 'useState', specifiedNameArray, 'formValue', matchIndex)!==0) {
            for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'useState', specifiedNameArray, 'formValue', matchIndex); i++) {
                output = output + `    const [formValues${(i+1)}, setFormValues${(i+1)}] = useState(initialFormValues${(i+1)});\n`;
                output = output + `    const [formError${(i+1)}, setFormError${(i+1)}] = useState(false);\n`;
                output = output + ` \n`;
            }
            matchIndex++;
        }
    }
    else if ( (hooks!==undefined) && (hooks.indexOf('useState')!=-1)  ) {

        specifiedNameArray=[];
        matchIndex=0;
        while (quickReact._findMultiplier(quickReactElement, 'useState', specifiedNameArray, 'appState', matchIndex)!==0) {
            for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'useState', specifiedNameArray, 'appState', matchIndex); i++) {
                output = output + ` const [${specifiedNameArray[i].lower}, set${specifiedNameArray[i].mixed}] = useState({});\n`;
                output = output + ` \n`;
            }
            matchIndex++;
        }
    }    
    
    if ( (useForm!==undefined) && (useForm===true) ) {
    output = output + 
    `
        // A typical _handleChange controlled form field handler
        const _handleChange = (event) => {
            setFormValues1((prevState) => {
              // console.log(prevState)
              return {
                ...prevState,
                [event.target.id]: event.target.value,
              };
            });
          };

          // A typical onBlur form field change validation handler
          const _handleVerifyForm = (event) => {
              if (formValues1.password !== formValues1.confirm_password) {
                  setFormError1(true);
              } else {
                  setFormError1(false);
              }     
          }

          // example handle user registration request via API post
          
          const _handleRegistration = async (event) => {

              event.preventDefault();          
              const API_URI='http:// localhost:4000/register';
          
              try {
                  const response = await fetch(API_URI, {
                      "method": 'POST',
                      "body": JSON.stringify(formValues1),
                      "headers": {
                          "Content-Type": 'application/json'
                      }
                  });
          
                  const data = await response.json();                  
                  if ( (response.status===200) || (response.status===201) ) {
                      setFormValues1(initialFormValues1);
                  }
                  else {
                    console.error('Registration Failed');
                  }                  
              } catch(error) {
                console.error(error);
              }
          
            } 
                    
    `;
    }

    if ( (hooks!==undefined) && (hooks.indexOf('useEffect')!=-1) ) {

        specifiedNameArray=[];
        matchIndex=0;
        while (quickReact._findMultiplier(quickReactElement, 'useEffect', specifiedNameArray, '_handleGenericAsync', matchIndex)!==0) {
        for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'useEffect', specifiedNameArray, '_handleGenericAsync', matchIndex); i++) {
        output = output + 
        `
          /*==========================================================================================*/
          // Preferred method formatting of placing async function calls inside the useEffect as an 
          // anonymous function
          useEffect( () => {    
              async function ${specifiedNameArray[i].lower}() {
                try {
        
                } catch(error) {
                  console.error(error);
                }
              }
            ${specifiedNameArray[i].lower}();
          }
          ,[]);
          /*==========================================================================================*/
        `;
        
        }
        matchIndex++;
        }
    }

    output=output + 
    `
      return (
     
        <div className="${quickReactElement.name.toLowerCase()}-container">
    `;
    
    if ( ((hooks!==undefined) && (hooks.indexOf('useContext')!=-1)) ) {
        specifiedNameArray=[];
        matchIndex=0;
        while (quickReact._findMultiplier(quickReactElement, 'useContext', specifiedNameArray, 'SampleContext', matchIndex)!==0) {
            for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'useContext', specifiedNameArray, 'SampleContext', matchIndex); i++) {
                output = output + `    <${specifiedNameArray[i].mixed}.Provider value={sampleState${(i+1)}} > \n`;
            }
            matchIndex++;
        }
    }

    if ( ((hooks!==undefined) && (hooks.indexOf('useReducer')!=-1)) ) {
            specifiedNameArray=[];
            matchIndex=0;
            while (quickReact._findMultiplier(quickReactElement, 'useReducer', specifiedNameArray, 'SampleDispatchContext', matchIndex)!==0) {
                for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'useReducer', specifiedNameArray, 'SampleDispatchContext', matchIndex); i++) {
                    output = output + `    <${specifiedNameArray[i].mixed}.Provider value={dispatch${(i+1)}} > \n`;
                }
                matchIndex++;
            }
    }   
    
    if ( (useForm!==undefined) && (useForm===true) && (useBootstrap) ) {

        if (quickReactElement.hasAttribute('forminputs')) {

            output = output + 
            `
            <>
            <Form onSubmit={_handleRegistration}>
            `;

            specifiedNameArray=[];
            matchIndex=0;
            while (quickReact._findMultiplier(quickReactElement, 'text', specifiedNameArray, 'textfield', matchIndex)!==0) {
            for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'text', specifiedNameArray, 'textfield', matchIndex); i++) {
            output = output +
            `
            <Form.Group className="mb-3" controlId="${specifiedNameArray[i].lower}">
            <Form.Label>*${specifiedNameArray[i].mixed}</Form.Label>
            <Form.Control type="text" onChange={_handleChange} value={formValues1.${specifiedNameArray[i].lower}} placeholder="" required/>
            </Form.Group>
            `;
            }
            matchIndex++;
            }


            specifiedNameArray=[];
            matchIndex=0;
            while (quickReact._findMultiplier(quickReactElement, 'textarea', specifiedNameArray, 'textareafield', matchIndex)!==0) {
            for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'textarea', specifiedNameArray, 'textareafield', matchIndex); i++) {
            output = output +
            `
            <Form.Group className="mb-3" controlId="${specifiedNameArray[i].lower}">
            <Form.Label>${specifiedNameArray[i].mixed}</Form.Label>
              <Form.Control
                as="textarea"
                name="${specifiedNameArray[i].lower}"
                value={formValues1.${specifiedNameArray[i].lower}}
                onChange={_handleChange}
                placeholder=""
                style={{ height: '200px' }}
                required
              />
            </Form.Group>
            `;      
            }
            matchIndex++;
            }
            
            specifiedNameArray=[];
            matchIndex=0;
            while (quickReact._findMultiplier(quickReactElement, 'password', specifiedNameArray, 'password', matchIndex)!==0) {
            for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'password', specifiedNameArray, 'password', matchIndex); i++) {
            output = output +
            `            
            <Form.Group className="mb-3" controlId="password">
            <Form.Label>*Select Password</Form.Label>
            <Form.Control type="password" onChange={_handleChange} value={formValues1.password} placeholder="Password Required" required />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="confirm_password">
            <Form.Label>*Confirm Password</Form.Label>
            <Form.Control type="password" onChange={_handleChange} onBlur={_handleVerifyForm} value={formValues1.confirm_password} placeholder="Confirm Password Required" required />
            </Form.Group>
            {formError && <Alert variant='danger'>Passwords must match!</Alert>}
            \n\n`;
            }
            matchIndex++;
            }

            specifiedNameArray=[];
            matchIndex=0;
            while (quickReact._findMultiplier(quickReactElement, 'checkbox', specifiedNameArray, 'checkbox', matchIndex)!==0) {
                for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'checkbox', specifiedNameArray, 'checkbox', matchIndex); i++) {
                    if (i===0) {
                        output = output + `         <div key='inline-checkbox' className="mb-3">\n`;
                    }
                    if (i>=0) {
                        output = output + `         <Form.Check inline label="${specifiedNameArray[i].mixed}" name="checkboxgroup-${specifiedNameArray[i].lower}" type='checkbox' id='inline-checkbox-${specifiedNameArray[i].lower}' />\n`;
                    }
                    if (i===quickReact._findMultiplier(quickReactElement, 'checkbox', specifiedNameArray, 'checkbox', matchIndex)-1) {
                        output = output + `         </div>\n\n`;
                    }
                }
                matchIndex++;
            }

            specifiedNameArray=[];
            matchIndex=0;
            while (quickReact._findMultiplier(quickReactElement, 'radio', specifiedNameArray, 'radio', matchIndex)!==0) {
                for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'radio', specifiedNameArray, 'radio', matchIndex); i++) {
                    if (i===0) {
                        output = output + `         <div key='inline-radio' className="mb-3">\n`;
                    }
                    if (i>=0) {
                        output = output + `         <Form.Check inline label="${specifiedNameArray[i].mixed}" name="radiogroup-${specifiedNameArray[i].lower}" type='radio' id='inline-radio-${specifiedNameArray[i].lower}' />\n`;
                    }
                    if (i===quickReact._findMultiplier(quickReactElement, 'radio', specifiedNameArray, 'radio', matchIndex)-1) {
                        output = output + `         </div>\n\n`;
                    }
                }
                matchIndex++;
            }

            specifiedNameArray=[];
            matchIndex=0;
            while (quickReact._findMultiplier(quickReactElement, 'select', specifiedNameArray, 'select', matchIndex)!==0) {
                for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'select', specifiedNameArray, 'select', matchIndex); i++) {
 
                    if (i===0) {
                        output = output + `         <Form.Group as={Col} controlId="formGridState${(i+1)}">\n`;
                    }

                    if (i>=0) {
                    output = output + 
                    `
                    <Form.Label>${specifiedNameArray[i].mixed}</Form.Label>
                    <Form.Select defaultValue="Choose...">
                        <option>Choose...</option>
                        <option value="IL">Illinois</option>
                        <option value="MI">Michigan</option>
                        <option value="NY">New York</option>
                    </Form.Select>
                    \n`;
                    }

                    if (i===quickReact._findMultiplier(quickReactElement, 'select', specifiedNameArray, 'select', matchIndex)-1) {
                        output = output + `         </Form.Group>\n`;
                    }
                } 
                matchIndex++;
            }

            output=output + 
            `
            <Button variant="primary" type="submit" disabled={formError}>
            Submit Form
            </Button>
    
            </Form>
    
            </>
    
            `;
    
        }
        else {
        output = output + 
        `
        <>
        <Form onSubmit={_handleRegistration}>

        <Form.Group className="mb-3" controlId="email">
        <Form.Label>*Email address</Form.Label>
        <Form.Control type="email" onChange={_handleChange} value={formValues1.email} placeholder="name@example.com" required/>
        </Form.Group>

        <Form.Group className="mb-3" controlId="first_name">
        <Form.Label>*First Name</Form.Label>
        <Form.Control type="text" onChange={_handleChange} value={formValues1.first_name} placeholder="First Name Required" required />
        </Form.Group>

        <Form.Group className="mb-3" controlId="last_name">
        <Form.Label>*Last Name</Form.Label>
        <Form.Control type="last_name" onChange={_handleChange} value={formValues1.last_name} placeholder="Last Name Required" required />
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
        <Form.Label>*Select Password</Form.Label>
        <Form.Control type="password" onChange={_handleChange} value={formValues1.password} placeholder="Password Required" required />
        </Form.Group>

        <Form.Group className="mb-3" controlId="confirm_password">
        <Form.Label>*Confirm Password</Form.Label>
        <Form.Control type="password" onChange={_handleChange} onBlur={_handleVerifyForm} value={formValues1.confirm_password} placeholder="Confirm Password Required" required />
        </Form.Group>
        {formError && <Alert variant='danger'>Passwords must match!</Alert>}

        <Button variant="primary" type="submit" disabled={formError}>
        Submit Registration Form
        </Button>

        </Form>

        </>

        `;
        }
    }

    if ( (useForm!==undefined) && (useForm===true) && (!useBootstrap) ) {

        if (quickReactElement.hasAttribute('forminputs')) {

            output = output + 
            `
            <>
            <form onSubmit={_handleRegistration}>
            `;

            specifiedNameArray=[];
            matchIndex=0;
            while (quickReact._findMultiplier(quickReactElement, 'text', specifiedNameArray, 'textfield', matchIndex)!==0) {
            for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'text', specifiedNameArray, 'textfield', matchIndex); i++) {
            output = output +
            `
                <div>
                <label htmlFor='${specifiedNameArray[i].lower}'>${specifiedNameArray[i].mixed} </label>
                    <input
                        type='text'
                        id='${specifiedNameArray[i].lower}'
                        value={formValues1.${specifiedNameArray[i].lower}}
                        placeholder=''
                        onChange={_handleChange}
                        required
                    />  
                </div>
            `;
            }
            matchIndex++;
            }

            specifiedNameArray=[];
            matchIndex=0;
            while (quickReact._findMultiplier(quickReactElement, 'textarea', specifiedNameArray, 'textarea', matchIndex)!==0) {
            for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'textarea', specifiedNameArray, 'textarea', matchIndex); i++) {
            output = output +
            `
            <div>
                <label htmlFor='${specifiedNameArray[i].lower}'>${specifiedNameArray[i].mixed} </label>
                <textarea name='${specifiedNameArray[i].lower}' id='${specifiedNameArray[i].lower}' value={formValues1.${specifiedNameArray[i].lower}} onChange={_handleChange} placeholder='' style={{ height: '200px' }} required>
                </textarea>
            </div>
            `;      
            }  
            matchIndex++;    
            }
            
            specifiedNameArray=[];
            matchIndex=0;
            while (quickReact._findMultiplier(quickReactElement, 'password', specifiedNameArray, 'password', matchIndex)!==0) {
            for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'password', specifiedNameArray, 'password', matchIndex); i++) {
            output = output +
            `            
            <fieldset>
                <label htmlFor='password${(i+1)}'>*Select Password</label>
                <input type="password" onChange={_handleChange} value={formValues1.password} placeholder="Password Required" required />
                </Form.Group>
            
                <label htmlFor='confirm_password${(i+1)}'>*Confirm Password</label>
                <input type="password" onChange={_handleChange} onBlur={_handleVerifyForm} value={formValues1.confirm_password} placeholder="Confirm Password Required" required />
                {formError && <Alert variant='danger'>Passwords must match!</Alert>}
            </fieldset>
            `;
            }
            matchIndex++;
            }

            specifiedNameArray=[];
            matchIndex=0;
            while (quickReact._findMultiplier(quickReactElement, 'checkbox', specifiedNameArray, 'checkbox', matchIndex)!==0) {
                for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'checkbox', specifiedNameArray, 'checkbox', matchIndex); i++) {
                    if (i===0) {
                        output = output + `            <div key='inline-checkbox' className="mb-3">`;
                    }
                    if (i>=0) {
                        output = output + `            <input name="checkboxgroup-${specifiedNameArray[i].lower}" type='checkbox' id='inline-checkbox-${specifiedNameArray[i].lower}'} />`;
                    }

                    if (i===quickReact._findMultiplier(quickReactElement, 'checkbox', specifiedNameArray, 'checkbox', matchIndex)-1) {
                        output = output + `            </div>`;
                    }
                }
                matchIndex++;
            }

            specifiedNameArray=[];
            matchIndex=0;
            while (quickReact._findMultiplier(quickReactElement, 'radio', specifiedNameArray, 'radio', matchIndex)!==0) {
                for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'radio', specifiedNameArray, 'radio', matchIndex); i++) {
                    if (i===0) {
                        output = output + `            <div key='inline-radio' className="mb-3">`;
                    }
                    if (i>=0) {
                        output = output + `            <input name="radiogroup-${specifiedNameArray[i].lower}" type='radio' id='inline-radio-${specifiedNameArray[i].lower}'} />`;
                    }

                    if (i===quickReact._findMultiplier(quickReactElement, 'radio', specifiedNameArray, 'radio', matchIndex)-1) {
                        output = output + `            </div>`;
                    }
                }
                matchIndex++;
            }


            specifiedNameArray=[];
            matchIndex=0;
            while (quickReact._findMultiplier(quickReactElement, 'select', specifiedNameArray, 'select', matchIndex)!==0) {
                for (let i=0; i<quickReact._findMultiplier(quickReactElement, 'select', specifiedNameArray, 'select', matchIndex); i++) {

                    if (i===0) {
                        output = output + `            <fieldset id="formGridState${(i+1)}">`;
                    }

                    if (i>=0) {
                        output = output + 
                        `
                        <label htmlFor="${specifiedNameArray[i].lower}">${specifiedNameArray[i].mixed}</Form.Label>
                        <select name="${specifiedNameArray[i].lower}" id="${specifiedNameArray[i].lower}" defaultValue="Choose...">
                            <option>Choose...</option>
                            <option value="IL">Illinois</option>
                            <option value="MI">Michigan</option>
                            <option value="NY">New York</option>
                        </select>
                        `;
                    }

                    if (i===quickReact._findMultiplier(quickReactElement, 'select', specifiedNameArray, 'select', matchIndex)-1) {
                        output = output + `            </fieldset>`;
                    }
                }
                matchIndex++;
            }

            output=output + 
            `
            <button type="submit" disabled={formError} className='form-button'>
            Submit Form
            </button>
    
            <form>
    
            </>
    
            `;
    
        }

        // // // // // // // // // // // // // // // // // // // // // // // // // // // // // /

        if (quickReactElement.hasAttribute('forminputs')) {
        output = output + 
        `

            <div>
                <label htmlFor='password'>Password: </label>
                    <input
                        type='password'
                        id='password'
                        value={formValues1.password}
                        onChange={_handleChange}
                        required
                    />
            </div>
            <input type='submit' value='Member Login' />
        </form>

        `;
        }
        else {
            output = output + 
            `
            <form onSubmit={_handleUserLogin}>
                <div>
                    <label htmlFor='username'>Username: </label>
                        <input
                            type='text'
                            id='username'
                            value={formValues1.username}
                            onChange={_handleChange}
                            required
                        />  
                </div>
                <div>
                    <label htmlFor='password'>Password: </label>
                        <input
                            type='password'
                            id='password'
                            value={formValues1.password}
                            onChange={_handleChange}
                            required
                        />
                </div>
                <input type='submit' value='Member Login' />
            </form>
    
            `;    
        }
    }

    if ( (useMap!==undefined) && (useMap===true) ) {
        output = output + 
        `
            // Sample array value mapping to JSX per-item output
            {
                listing.map( (item, index) => {
                        return (
                            <div key={index}>
                                <li>{item.name}</li>
                            </div>
                        )
                    });
            }

        `;
    }

    if ((reactSwitch!==undefined) && (reactSwitch===true)) {
        output = output + `        <Switch>\n`;
    }

    if ((reactRoute!==undefined) && (reactRoute===true)) {
    output = output + `
                <Route path="/login" exact>
                  <SampleComponent />
                </Route>
                <Route path="/logout/:id" component={SampleComponent} exact />
                <Route path="/somepath" render={routeProps => (<Component {...routeProps} />)} />
                <Route path="/home" render={() => <div>Home</div>} />
    `;
    }

    if ((reactSwitch!==undefined) && (reactSwitch===true)) {
        output = output + `       </Switch>\n`;
    }
    
    if ((reactLink!==undefined) && (reactLink===true)) {
        output = output + `        <Link to="/">Home</Link>\n`;
    }
    
    if ( 
        ((hooks!==undefined) && (hooks.indexOf('useReducer')!=-1)) 
        ) {
            specifiedNameArray=[];
            matchIndex=0;
            while (quickReact._findMultiplier(quickReactElement, 'useReducer', specifiedNameArray, 'SampleDispatchContext', matchIndex)!==0) {
                for (let i=quickReact._findMultiplier(quickReactElement, 'useReducer', specifiedNameArray, 'SampleDispatchContext', matchIndex); i>0; i--) {
                    output = output + `    </${specifiedNameArray[i].mixed}.Provider>\n`;
                }
                matchIndex++;
            }
    }
    
    if ( 
        ((hooks!==undefined) && (hooks.indexOf('useContext')!=-1))   
        ) {
            specifiedNameArray=[];
            matchIndex=0;
            while (quickReact._findMultiplier(quickReactElement, 'useContext', specifiedNameArray, 'SampleContext', matchIndex)!==0) { 
                for (let i=quickReact._findMultiplier(quickReactElement, 'useContext', specifiedNameArray, 'SampleContext', matchIndex); i>0; i--) {
                    output = output + `    </${specifiedNameArray[i].mixed}.Provider>\n`;
                }
                matchIndex++;
            }
    }
    
    output=output + 
    `
        </div>
      );
      
    }
    
    export default ${quickReactElement.name};
    
    `;
    
    return output;

}
        

/*================================================================================================*/
// Export these library classes to other node modules

module.exports = { QuickReactElement, QuickReact };



