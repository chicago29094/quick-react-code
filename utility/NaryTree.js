
/*================================================================================================*/
// n-ary Nodes have an item value, which can be any data type, although preferably an object, and 
// an array of reference pointers to the node's children
class NaryNode {

    constructor(childObj) {
        if ( (childObj===undefined) || (childObj===null) ) {
            throw TypeError('n-ary Nodes must be instantiated with a valid child object')
        }
        this._value=childObj;
        this._children=[];
    }

    get children() {
        return this._children;
    }

    get value() {
        return this._value;
    }

    set children(newArray) {
        this._children=newArray;
    }

    set value(newValue) {
        this._value=newValue;
    }

}

/*================================================================================================*/
// This is an implementation of an iterable n-ary tree data structure and associated methods.
// An n-ary tree is a tree data structure where any node may have an arbitrary number of 
// child nodes. This can potentially used as a trie, but it is not designed for that purpose.

class NaryTree {

    // Instantiates an empty n-ary tree as a JavaScript object
    constructor() {
        this._tree={};
        this._size=0;
        this._modCount=0;
    }

    // Adds the parameter child object as root or the root node's next child
    // Returns a boolean value
    add(childObj) {
        if ( (childObj===undefined) || (childObj===null) ) {
            throw new TypeError('A valid child object must be specified to add a node to the n-ary tree.');
        }

        // Add the root node itself
        if (this.isEmpty()) {
            const node = new NaryNode(childObj);
            this._tree = node;
            this._root = node;
            this._size++;
            this._modCount++;
        }
        // Add the next child for the root node
        else {
            const node = new NaryNode(childObj);
            this._root.children.push(node);
            this._size++;
            this._modCount++;            
        }
        return true;
    }

    /*================================================================================================*/
    // Adds child as the the first child of the parent node in the n-ary tree
    // Returns a boolean value
    addAsFirstChild(childObj, parent) {
        if ( (childObj===undefined) || (childObj===null) ) {
            throw new TypeError('A valid child object must be specified to add a node to the n-ary tree.');
        }        
        if ( (parent===undefined) || (parent===null) || !(parent instanceof NaryNode) ) {
            throw new TypeError('A valid n-ary parent node must be specified to add a node to the n-ary tree.');
        }        
        const node = new NaryNode(childObj)
        parent.children.unshift(node);
        this._size++;
        this._modCount++;
        return true;
    }

    /*================================================================================================*/
    // Adds child as the the last child of the parent node in the n-ary tree
    // Returns a boolean value
    addAsLastChild(childObj, parent) {
        if ( (childObj===undefined) || (childObj===null) ) {
            throw new TypeError('A valid child object must be specified to add a node to the n-ary tree.');
        }        
        if ( (parent===undefined) || (parent===null) || !(parent instanceof NaryNode) ) {
            throw new TypeError('A valid n-ary parent node must be specified to add a node to the n-ary tree.');
        }                
        const node = new NaryNode(childObj)
        parent.children.push(node);
        this._size++;
        this._modCount++;        
        return true;
    }

    /*================================================================================================*/
    // Adds child as the the position child of the parent node in the n-ary tree using level-order traversal
    // Returns a boolean value
    addAtPosition(childObj, parent, position) {
        if ( (childObj===undefined) || (childObj===null) ) {
            throw new TypeError('A valid child object must be specified to add a node to the n-ary tree.');
        }        
        if ( (parent===undefined) || (parent===null) || !(parent instanceof NaryNode) ) {
            throw new TypeError('A valid n-ary parent node must be specified to add a node to the n-ary tree.');
        }              
        if ( (position<0) || (position>parent.children.length) ) {
            throw new RangeError('Position out of range. A tree node can not be added at the specified position.');
        }
        const node = new NaryNode(childObj)
        parent.children.splice(position, 0, node);
        this._size++;
        this._modCount++;        
        return true;
    }

    /*================================================================================================*/
    // Make this n-ary tree empty
    // Returns a boolean value
    clear() {
		this._root = null;
		this._size = 0;
		this._modCount++;
        return true;
    }

    /*================================================================================================*/
    // Indicates whether an existing object, passed as an argument, exists in this n-ary tree
    // If parentNode is specified contains only looks within the subtree rooted in the parentNode
    // If obj is itself an n-ary Node a search-by-node is performed instead of a search for a matching object
    // Returns a boolean value
    contains(obj, parentNode) {

        let rootNode = {};

        if ( (obj===undefined) || (obj===null) ) {
            throw new TypeError('A valid child object must be specified when searching the n-ary tree for an object.');
        }     

        if ( (parentNode!==undefined) && (parentNode!==null) ) {
            rootNode=parentNode;
        }
        else {
            rootNode = this.root;
        }

        const treeIterator = this.levelOrderIterator(rootNode);
 
        for (let node of treeIterator) {
            if ( (node===obj) || (node.value===obj) ) {
                return true;
            }
        }    
        
        return false;
    }

    /*================================================================================================*/
    // Return the root node of this n-ary tree
    get root() {
        return this._root;
    }

    /*================================================================================================*/
    // In no object parameter is specified, return the root node object
    // In an object is specified, get returns the first occurrence of the specified object using a level-order tree traversal iterator.
    get(obj) {

        if ( (obj===undefined) || (obj===null) ) {
            return this._root.value;
        }

        const treeIterator = this.levelOrderIterator(this._root);

        for (let node of treeIterator) {
            if (node.value===obj) {
                return node.value;
            }
        }
        return null;
    }

    /*================================================================================================*/
    // getNode returns the n-ary tree node reference for the first occurrence of the specified object passed as an argument to the method.
    getNode(obj) {

        if ( (obj===undefined) || (obj===null) ) {
            return this._root;
        }

        const treeIterator = this.levelOrderIterator(this._root);

        for (let node of treeIterator) {
            if (node.value===obj) {
                return node;
            }
        }
        return null;
    }

    /*================================================================================================*/
    // In no object parameter is specified, return the root node object
    // In an object is specified, get returns the first occurrence of the specified object using a level-order tree traversal iterator.
    getByObjectProperty( obj ) {

        if ( (obj===undefined) || (obj===null) ) {
            return this._root.value;
        }

        const [key,value] = Object.entries(obj)[0];

        const treeIterator = this.levelOrderIterator(this._root);

        for (let node of treeIterator) {
            if ( (node.value[key]!==undefined) && (node.value[key]===value) ) {
                return node.value;
            }
        }
        return null;
    }

    /*================================================================================================*/
    // getNode returns the n-ary tree node reference for the first occurrence of the specified object passed as an argument to the method.
    getNodeByObjectProperty( obj ) {

        if ( (obj===undefined) || (obj===null) ) {
            return this._root;
        }

        const [key,value] = Object.entries(obj)[0];

        const treeIterator = this.levelOrderIterator(this._root);

        for (let node of treeIterator) {
            if ( (node.value[key]!==undefined) && (node.value[key]===value) ) {
                return node;
            }
        }
        return null;
    }

    /*================================================================================================*/
    // returns the object in the root node of the tree
    getRootItem() {
        return this._root.value;
    }

    /*================================================================================================*/
    // if naryNode is not specified, height returns the height of the naryTree from the root to the leaf nodes
    // if naryNode is specified, height return the height of the naryTree from the naryNode to the leaf nodes
    height(naryNode) {
        if (this._size===0) {
            return 0;
        }
        if ( (naryNode===undefined) || (naryNode===null) ) {
            return this.height(this._root);
        }
        else {
            if (naryNode.children.length===0) {
                return 1;
            }

            return 1+(naryNode.children.reduce( (value, node, index, array) => {
                return Math.max(value, this.height(node));
            }, -1 ) );
        }
    }

    /*================================================================================================*/
    // Returns a boolean value reflecting whether the n-ary tree is empty or not
    isEmpty() {
        return (this._size===0)
    }

    /*================================================================================================*/
    // returns a level-order iterator for this n-ary tree
    * iterator(node) {
        return this.levelOrderIterator(node)    
    }

    /*================================================================================================*/
    // returns a level-order iterator for this n-ary tree
    * levelOrderIterator(node) {

        if (node===undefined || node===null) {
            return null;
        }
        const queue=[];
        queue.push(node);
        while (queue.length!==0) {

            let numNodes = queue.length;

            while (numNodes > 0) {

                const yieldNode = queue.shift();
                yield yieldNode;

                for (let child of yieldNode.children) {
                    queue.push(child);
                }
                numNodes--;
            }
        }

    }

    /*================================================================================================*/
    // returns a pre-order iterator for this n-ary tree
    * preOrderIterator(node) {

        if (node===undefined || node===null) {
            return null;
        }

        yield node;

        for (let child of node.children) {
            yield * this.preOrderIterator(child);
        }

    }

    /*================================================================================================*/
    // If obj is not specified, remove removes the first item in the n-ary tree
    // If obj is specified, remove removes the first occurrence of the specified object
    // If object and parent are specified, remove removes the first occurrence of the specified object which is a descendant of the parent obj
    remove(obj, parent) {

        let removeNode={};
        // Check to see if obj wasn't passed as an argument
        if ( (obj===undefined) || (obj===null) ) {
            // Although there is a common convention for removing a node in a binary tree, including the root node, 
            // this is less clear for an n-ary tree.  In this implementation, we will move the left-most 
            // child node into the position as the root node and make the other former root node children,
            // children of this new root node.  If the intent was to remove the entire tree, the clear method
            // could be utilized for that purpose.

            // First, check to see if the root node has no children, if so clear the entire tree
            if (this._root.children.length===0) {
                this.clear();
                return true;
            }
            else if (this._root.children.length>=1) {
                const previousRoot=this._root;  // Temporary placeholder of reference to previous root node
                this._root = previousRoot.children.shift(); // The new root is the first left-most child of the previous root node
                this._size -= 1; // The tree size is decreasing by one
                this._modCount++;
                // Add the remaining children of the previous root node as children of the new root node
                this.root.children=this.root.children.concat(previousRoot.children);
                return true;    
            }
        }
        // Was obj passed as an argument to the method?
        else if ( (obj!==undefined) && (obj!==null) ) {
            
            // A parent node was specified, so we much only look in the parent node's subtree for the target object
            if ( (parent!==undefined) && (parent!==null) ) {
                const treeIterator = this.levelOrderIterator(parent);

                let found=false;
                for (let node of treeIterator) {
                    if (node.value===obj) {
                        removeNode=node;
                        found=true;
                    }                   
                }                               
            }
            else {
                removeNode = this.getNode(obj);
            }

            if (removeNode===null) {
                throw new ReferenceError('The specified object reference is not present in this n-ary tree.');
            }
            if (removeNode===this._root) {
                this.remove(); // The remove node is the tree's root node, which is a special case.
                return true;
            }
            // First, check to see if the remove node has no children, if so we simply need to only remove a reference to this child from its parent node's children array
            if (removeNode.children.length===0) {
                const treeIterator = this.levelOrderIterator(this._root);
                let found=false;
                for (let node of treeIterator) {
                    let index=node.children.indexOf(removeNode);
                    if (index!=-1) {
                        node.children.splice(index, 1);
                        found=true;
                        this._size -= 1; // The tree size is decreasing by one
                        this._modCount++;                        
                    }
                }                
                return true;
            }
            // If the target remove node has children, we need to move the move node's children up into its parent node's children array
            else if (removeNode.children.length>=1) {
                const treeIterator = this.levelOrderIterator(this._root);

                let found=false;
                for (let node of treeIterator) {
                    let index=node.children.indexOf(removeNode);
                    if (index!=-1) {
                        node.children.splice(index, 1);
                        node.children=node.children.concat(removeNode.children);
                        found=true;
                        this._size -= 1; // The tree size is decreasing by one
                        this._modCount++;                        
                    }
                }          

                return true;
            }            
        }
    }

    /*================================================================================================*/
    // Removed the n-ary Node passed as a parameter.  If no value is passed, the root node is used.
    removeNode(naryNode) {

        let removeNode={};
        let parentNode={};

        // Check to see if obj wasn't passed as an argument
        if ( (naryNode===undefined) || (naryNode===null) ) {
            // Although there is a common convention for removing a node in a binary tree, including the root node, 
            // this is less clear for an n-ary tree.  In this implementation, we will move the left-most 
            // child node into the position as the root node and make the other former root node children,
            // children of this new root node.  If the intent was to remove the entire tree, the clear method
            // could be utilized for that purpose.

            // First, check to see if the root node has no children, if so clear the entire tree
            if (this._root.children.length===0) {
                this.clear();
                return true;
            }
            else if (this._root.children.length>=1) {
                const previousRoot=this._root;  // Temporary placeholder of reference to previous root node
                this._root = previousRoot.children.shift(); // The new root is the first left-most child of the previous root node
                this._size -= 1; // The tree size is decreasing by one
                this._modCount++;
                // Add the remaining children of the previous root node as children of the new root node
                this.root.children=this.root.children.concat(previousRoot.children);
                return true;    
            }
        }
        // Was maryNode passed as an argument to the method?
        else if ( (naryNode!==undefined) && (naryNode!==null) ) {

            removeNode=naryNode;

            if (!this.contains(removeNode)) {
                 throw new ReferenceError('The specified node reference is not present in this n-ary tree.');
            }
            if (removeNode===this._root) {
                this.remove(); // The remove node is the tree's root node, which is a special case.
                return true;
            }
            // First, check to see if the remove node has no children, if so we simply need to only remove a reference to this child from its parent node's children array
            if (removeNode.children.length===0) {
                const treeIterator = this.levelOrderIterator(this._root);
                let found=false;
                for (let node of treeIterator) {
                    let index=node.children.indexOf(removeNode);
                    if (index!=-1) {
                        node.children.splice(index, 1);
                        found=true;
                        this._size -= 1; // The tree size is decreasing by one
                        this._modCount++;                        
                    }
                }                
                return true;
            }
            // If the target remove node has children, we need to move the move node's children up into its parent node's children array
            else if (removeNode.children.length>=1) {
                const treeIterator = this.levelOrderIterator(this._root);

                let found=false;
                for (let node of treeIterator) {
                    let index=node.children.indexOf(removeNode);
                    if (index!=-1) {
                        node.children.splice(index, 1);
                        node.children=node.children.concat(removeNode.children);
                        found=true;
                        this._size -= 1; // The tree size is decreasing by one
                        this._modCount++;                        
                    }
                }          

                return true;
            }            
        }
    }

    /*================================================================================================*/
    // Removes the complete subtree having the specified object in the subtree's root node
    // If parent node is specified the object must be underneath the parent node
    removeSubtree(obj, parentNode) {

        let rootNode = {};

        if ( (obj===undefined) || (obj===null) ) {
            throw new TypeError('A valid object must be specified when removing a sub-tree by object.')
        }

        if ( (parentNode!==undefined) && (parentNode!==null) ) {
            rootNode=parentNode;
        }
        else {
            rootNode = this.root;
        }

        let treeIterator = this.levelOrderIterator(rootNode);

        let removeNode={};
        let found=false;
        for (let node of treeIterator) {
            if (node.value===obj) {
                removeNode=node;
                found=true;
            }
        }

        if (found===false) {
            throw new ReferenceError('The specified object was not found in this n-ary tree.');
        }

        // Check to see if the matching object was in the root node, which is a special case

        if (removeNode===this._root) {
            this.clear(); // The remove node is the tree's root node, which is a special case.
            return true;           
        }

        // Next, we need to find the parent node of this matching n-ary node
        treeIterator = this.levelOrderIterator(this._root);

        found=false;
        for (let node of treeIterator) {
            let index=node.children.indexOf(removeNode);
            if (index!=-1) {
                node.children.splice(index, 1);
                found=true;
                this._size -= 1; // The tree size is decreasing by one
                this._modCount++;                
            }
        }          

        return true;
    }

    /*================================================================================================*/
    // Removes the complete subtree where the naryTree node parameter is the root node of the sub-tree
    removeNodeSubtree(naryNode) {
 
        let rootNode = {};

        if ( (naryNode!==undefined) && (naryNode!==null) ) {
            rootNode=naryNode;
        }
        else {
            rootNode = this.root;
        }

        let treeIterator = this.levelOrderIterator(rootNode);

        let removeNode={};
        let found=false;
        for (let node of treeIterator) {
            if (node===naryNode) {
                removeNode=node;
                found=true;
            }
        }

        if (found===false) {
            throw new ReferenceError('The specified object was not found in this n-ary tree.');
        }

        // Check to see if the matching object was in the root node, which is a special case

        if (removeNode===this._root) {
            this.clear(); // The remove node is the tree's root node, which is a special case.
            return true;           
        }

        // Next, we need to find the parent node of this matching n-ary node
        treeIterator = this.levelOrderIterator(this._root);

        found=false;
        for (let node of treeIterator) {
            let index=node.children.indexOf(removeNode);
            if (index!=-1) {
                node.children.splice(index, 1);
                found=true;
                this._size -= 1; // The tree size is decreasing by one
                this._modCount++;                
            }
        }          

        return true;
    }

    /*================================================================================================*/
    // If naryNode is not specified, returns in the current size of the n-ary tree as a node count
    // If naryNode is specified, returns in the current size of the n-ary tree rooted from the specified node as a node count
    size(naryNode) {
        if (naryNode===undefined) {
            return this._size;
        }

        let treeIterator = this.levelOrderIterator(this._root);

        let sizeNode={};
        let found=false;
        for (let node of treeIterator) {
            if (node===naryNode) {
                sizeNode=node;
                found=true;
            }
        }

        if (found===false) {
            throw new ReferenceError('The specified nary-node was not found in this n-ary tree.');
        }

        if (sizeNode===this._root) {
            return this._size;           
        }

        treeIterator = this.levelOrderIterator(sizeNode);

        let treeSize=0;
        for (let node of treeIterator) {
            treeSize++;
        }
        return treeSize;
        
    }

    /*================================================================================================*/
    // If naryNode is not specified, returns a string representation of the entire n-ary tree
    // If naryNode is specified, returns a string representation of the n-ary tree from the specified naryNode 
    toString(naryNode=this._root, relLevel=1) {
        let str="";
        let node = {};

        // if this method wasn't invoked with a n-ary node, start from the root node
        if ( (naryNode===undefined) || (naryNode===null) ) {
            node=this._root;
        }
        else {
            node = naryNode;
        }

        const leftMargin = " ".repeat(relLevel*6);
        str=str + leftMargin + `Level:${relLevel} - ${node.value} \n`;
        for (let child of node.children) {
            str=str+this.toString(child, relLevel+1);
        }
        return str;
    }

    /*================================================================================================*/
    // If naryNode is not specified, returns a JSON representation of the entire n-ary tree
    // If naryNode is specified, returns a JSON representation of the n-ary tree from the specified naryNode 
    toJSON(naryNode=this._root, relLevel=1) {

        let str = "";
        let node = {}

        if (naryNode===undefined || naryNode===null) {
            node = this._root;
        }
        else {
            node = naryNode;
        }

        const leftMargin=" ".repeat(relLevel*15);

        if (naryNode===this._root) {
            str = str + "{\n"
            str = str + leftMargin + `    "root": ${node.value},\n`;
        }
        else {
            str = str + leftMargin + `    "node": ${node.value},\n`;
        }

        if (node.children.length===0) {
            str = str + leftMargin + `    "children": {}\n`;            
        } 
        else {
            str = str + leftMargin + `    "children": {\n`;            
        }

        for (let child of node.children) {
            str = str + this.toJSON(child, relLevel+1);
        }        


        if (node.children.length!==0) {
            str = str + leftMargin + `                ` + "}\n";
        }

        if (naryNode===this._root) {
            str = str + "}\n"
        }
        return str;
    }

}


/*================================================================================================*/
// Export these library classes to other node modules

module.exports = { NaryNode, NaryTree };
