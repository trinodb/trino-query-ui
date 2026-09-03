// Define a generic TabInfo interface
interface TabInfo {
    id: string
    title: string
    isPinned: boolean
}

export default TabInfo

// import { v4 as uuidv4 } from 'uuid';

// abstract class TabInfo {
//     readonly id: string;
//     title: string;
//     isPinned: boolean;

//     constructor(title: string, id: string = uuidv4(), isPinned: boolean = false) {
//         this.id = id;
//         this.title = title;
//         this.isPinned = isPinned;
//     }
// }

// export default TabInfo;
