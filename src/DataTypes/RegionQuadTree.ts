import Vec2 from "./Vec2";
import Collection from "./Collection";
import AABB from "./AABB"
import { Region, Unique } from "./Interfaces/Descriptors";
import Map from "./Map";

/**
 * Primarily used to organize the scene graph
 */
export default class QuadTree<T extends Region & Unique> implements Collection {
    /**
     * The center of this quadtree
     */
    protected boundary: AABB;

    /**
     * The number of elements this quadtree root can hold before splitting
     */
    protected capacity: number;

    /**
     * The maximum height of the quadtree from this root
     */
    protected maxDepth: number;

    /**
     * Represents whether the quadtree is a root or a leaf
     */
    protected divided: boolean;

    /**
     * The array of the items in this quadtree
     */
    protected items: Array<T>;

    // The child quadtrees of this one
    protected nw: QuadTree<T>;
    protected ne: QuadTree<T>;
    protected sw: QuadTree<T>;
    protected se: QuadTree<T>;

    constructor(center: Vec2, size: Vec2, maxDepth?: number, capacity?: number){
        this.boundary = new AABB(center, size);
        this.maxDepth = maxDepth !== undefined ? maxDepth : 10
        this.capacity = capacity ? capacity : 10;
        
        // If we're at the bottom of the tree, don't set a max size
        if(this.maxDepth === 0){
            this.capacity = Infinity;
        }

        this.divided = false;
        this.items = new Array();
    }

    /**
     * Inserts a new item into this quadtree. Defers to children if this quadtree is divided
     * or divides the quadtree if capacity is exceeded with this add.
     * @param item The item to add to the quadtree
     */
    insert(item: T): void {
        // If the item is inside of the bounds of this quadtree
        if(this.boundary.overlaps(item.getBoundary())){
            if(this.divided){
                // Defer to the children
                this.deferInsert(item);
            } else if (this.items.length < this.capacity){
                // Add to this items list
                this.items.push(item);
            } else {
                // We aren't divided, but are at capacity - divide
                this.subdivide();
                this.deferInsert(item);
                this.divided = true;
            }
        }
    }

    /**
     * Returns all items at this point.
     * @param point The point to query at
     */
    queryPoint(point: Vec2): Array<T> {
        // A matrix to keep track of our results
        let results = new Array<T>();

        // A map to keep track of the items we've already found
        let uniqueMap = new Map<T>();

        // Query and return
        this._queryPoint(point, results, uniqueMap);
        return results;
    }

    /**
     * A recursive function called by queryPoint
     * @param point The point being queried
     * @param results The results matrix
     * @param uniqueMap A map that stores the unique ids of the results so we know what was already found
     */
    protected _queryPoint(point: Vec2, results: Array<T>, uniqueMap: Map<T>): void {
        // Does this quadtree even contain the point?
        if(!this.boundary.containsPointSoft(point)) return;

        // If the matrix is divided, ask its children for results
        if(this.divided){
            this.nw._queryPoint(point, results, uniqueMap);
            this.ne._queryPoint(point, results, uniqueMap);
            this.sw._queryPoint(point, results, uniqueMap);
            this.se._queryPoint(point, results, uniqueMap);
        } else {
            // Otherwise, return a set of the items
            for(let item of this.items){
                let id = item.getId().toString();
                // If the item hasn't been found yet and it contains the point
                if(!uniqueMap.has(id) && item.getBoundary().containsPoint(point)){
                    // Add it to our found points
                    uniqueMap.add(id, item);
                    results.push(item);
                }
            }
        }
    }

/**
     * Returns all items at this point.
     * @param point The point to query at
     */
    queryRegion(boundary: AABB): Array<T> {
        // A matrix to keep track of our results
        let results = new Array<T>();

        // A map to keep track of the items we've already found
        let uniqueMap = new Map<T>();

        // Query and return
        this._queryRegion(boundary, results, uniqueMap);
        return results;
    }

    /**
     * A recursive function called by queryPoint
     * @param point The point being queried
     * @param results The results matrix
     * @param uniqueMap A map that stores the unique ids of the results so we know what was already found
     */
    protected _queryRegion(boundary: AABB, results: Array<T>, uniqueMap: Map<T>): void {
        // Does this quadtree even contain the point?
        if(!this.boundary.overlaps(boundary)) return;

        // If the matrix is divided, ask its children for results
        if(this.divided){
            this.nw._queryRegion(boundary, results, uniqueMap);
            this.ne._queryRegion(boundary, results, uniqueMap);
            this.sw._queryRegion(boundary, results, uniqueMap);
            this.se._queryRegion(boundary, results, uniqueMap);
        } else {
            // Otherwise, return a set of the items
            for(let item of this.items){
                let id = item.getId().toString();
                // If the item hasn't been found yet and it contains the point
                if(!uniqueMap.has(id) && item.getBoundary().overlaps(boundary)){
                    // Add it to our found points
                    uniqueMap.add(id, item);
                    results.push(item);
                }
            }
        }
    }

    /**
     * Divides this quadtree up into 4 smaller ones - called through insert.
     */
    protected subdivide(): void {
        let x = this.boundary.x;
        let y = this.boundary.y;
        let hw = this.boundary.hw;
        let hh = this.boundary.hh;

        this.nw = new QuadTree(new Vec2(x-hw/2, y-hh/2), new Vec2(hw/2, hh/2), this.maxDepth - 1);
        this.ne = new QuadTree(new Vec2(x+hw/2, y-hh/2), new Vec2(hw/2, hh/2), this.maxDepth - 1)
        this.sw = new QuadTree(new Vec2(x-hw/2, y+hh/2), new Vec2(hw/2, hh/2), this.maxDepth - 1)
        this.se = new QuadTree(new Vec2(x+hw/2, y+hh/2), new Vec2(hw/2, hh/2), this.maxDepth - 1)

        this.distributeItems();
    }

    /**
     * Distributes the items of this quadtree into its children.
     */
    protected distributeItems(): void {
        this.items.forEach(item => this.deferInsert(item));

        // Delete the items from this array
        this.items.forEach((item, index) => delete this.items[index]);
        this.items.length = 0;
    }

    /**
     * Defers this insertion to the children of this quadtree 
     * @param item 
     */
    protected deferInsert(item: T): void {
        this.nw.insert(item);
        this.ne.insert(item);
        this.sw.insert(item);
        this.se.insert(item);
    }

    /**
     * Renders the quadtree for demo purposes.
     * @param ctx 
     */
    public render_demo(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = "#0000FF";
        ctx.strokeRect(this.boundary.x - this.boundary.hw, this.boundary.y - this.boundary.hh, 2*this.boundary.hw, 2*this.boundary.hh);

        if(this.divided){
            this.nw.render_demo(ctx);
            this.ne.render_demo(ctx);
            this.sw.render_demo(ctx);
            this.se.render_demo(ctx);
        }
    }

    forEach(func: Function): void {
        // If divided, send the call down
        if(this.divided){
            this.nw.forEach(func);
            this.ne.forEach(func);
            this.sw.forEach(func);
            this.se.forEach(func);
        } else {
            // Otherwise, iterate over items
            for(let i = 0; i < this.items.length; i++){
                func(this.items[i]);
            }
        }
    }

    clear(): void {
        delete this.nw;
        delete this.ne;
        delete this.sw;
        delete this.se;

        for(let item in this.items){
            delete this.items[item];
        }

        this.items.length = 0;

        this.divided = false;

    }

}