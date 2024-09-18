import {
  getById,
  getEl,
  getElA,
  uuid,
  sha256,
  random_bkcolor,
  startCountdown,
  getCurrentDateTime,
  wiki_APi,
  debounce
} from "./js/func.js";



const tabnav = document.getElementById('tabnav');
const ribbon = document.getElementById('ribbon');


// 使用事件委托监听tabnav上的mouseover事件
tabnav.addEventListener('mouseover', function (event) {
  // 确保事件是<li>元素触发的
  if (event.target.tagName === 'LI') {

    const lis = tabnav.querySelectorAll('li');
    lis.forEach(li => {
      li.classList.remove('active');
    });
    event.target.classList.add('active');

    const ribbonTabs = ribbon.querySelectorAll('.tab');
    ribbonTabs.forEach(tab => {
      tab.classList.remove('active');
    });

    // 获取当前悬停的li元素的data-uuid值
    const uuid = event.target.getAttribute('data-uuid');

    // 根据uuid查找并激活对应的ribbon标签页
    const activeTab = ribbon.querySelector(`.tab[data-uuid="${uuid}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
    }
  }
});

//

let labelsData = null;
let imagesData = null;
let tabsData = null;

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw error;
  }
}

async function loadData() {
  try {
    // 并行加载标签数据和图像数据
    const [labels, images, tabs] = await Promise.all([
      fetchData('/json/getLabel.json'),
      fetchData('/json/getImage.json'),
      fetchData('/json/getTabs.json')
    ]);


    // 赋值给全局变量
    labelsData = labels;
    imagesData = images;
    tabsData = tabs;


  } catch (error) {
    console.error('Failed to load data:', error);
    labelsData = null;
    imagesData = null;
    tabsData = null;
  }
}

async function getDataById(controlId, type) {
  // 确保数据已加载
  if (!labelsData || !imagesData || !tabsData) {
    await loadData();
  }

  if (type === 'label') {
    if (labelsData) {
      // console.log("controlId", controlId);
      // console.log("controlId", labelsData[controlId]);
      return labelsData[controlId];
    } else {
      console.error('Labels data is not loaded yet.');
      return null;
    }
  } else if (type === 'image') {
    if (imagesData) {
      return imagesData[controlId];
    } else {
      console.error('Images data is not loaded yet.');
      return null;
    }
  } else if (type === 'tab') {
    if (tabsData) {
      return tabsData[controlId];
    } else {
      console.error('Images data is not loaded yet.');
      return null;
    }
  } else {
    console.error('Invalid type specified. Use "label" or "image".');
    return null;
  }
}



loadData().then(() => {
  console.log('Labels Data:', labelsData);
  console.log('Images Data:', imagesData);
});




const customButton = document.getElementById('customButton');
const fileInput = document.getElementById('fileInput');



// 拖拽按钮排序
let list = document.querySelector('#ribbon')


let currentLi
let sortLine = document.createElement('div');
sortLine.className = 'sortable-line';


list.addEventListener('dragstart', (e) => {
  //console.log(e.target);
  e.dataTransfer.effectAllowed = 'move'
  currentLi = e.target
  setTimeout(() => {
    currentLi.classList.add('moving')
  })
})

list.addEventListener('dragenter', (e) => {
  e.preventDefault()


  if (e.target === currentLi || e.target === list) {
    return
  }



  // console.log(e);
  // console.log(e.target.closest('.button'));
  // console.log(e.target.closest('.group'));

  let tab = e.target.closest('html')
  let target = e.target.closest('.button')
  let targetuuid

  tab.appendChild(sortLine)


  if (target) {
    targetuuid = target.getAttribute('data-uuid')
    console.log(targetuuid);
    const rect = target.getBoundingClientRect();
    const posX = e.clientX - rect.left;
    const width = rect.width / 2;

    sortLine.style.top = rect.top + 'px';
    sortLine.style.height = rect.height + 'px';

    if (posX < width) {
      // sortLine.className = 'sortable-line before-line';
      // target.appendChild(sortLine);
      // target.parentNode.insertBefore(sortLine, target);

      sortLine.style.left = rect.left + 'px';
      console.log(sortLine, rect);

    } else {
      // sortLine.className = 'sortable-line after-line';

      // target.appendChild(sortLine)
      // target.parentNode.insertBefore(sortLine, target.nextSibling);
      sortLine.style.left = rect.left + rect.width + 4 + 'px';
    }
    // sortLine.style.display = 'block';

  }

  // let liArray = Array.from(list.childNodes)
  // let currentIndex = liArray.indexOf(currentLi)
  // let targetindex = liArray.indexOf(e.target)

  // if (currentIndex < targetindex) {

  //   list.insertBefore(currentLi, e.target.nextElementSibling)
  // } else {

  //   list.insertBefore(currentLi, e.target)
  // }
})


list.addEventListener('dragover', (e) => {
  e.preventDefault()



})

list.addEventListener('dragend', (e) => {
  currentLi.classList.remove('moving')
  sortLine.className = 'sortable-line';

})





// 两栏调整大小
let dragging = false;

document.getElementById('dragbar').addEventListener('mousedown', function (e) {
  dragging = true;
  document.body.style.cursor = 'ew-resize';
});

document.addEventListener('mousemove', function (e) {
  if (dragging) {
    let container = document.getElementById('container');
    let leftSidebar = document.getElementById('leftSidebar');
    let rightSidebar = document.getElementById('rightSidebar');
    let dragbar = document.getElementById('dragbar');
    let offsetX = e.clientX - container.offsetLeft;
    let containerWidth = container.clientWidth;
    leftSidebar.style.width = offsetX + 'px';
    rightSidebar.style.width = (containerWidth - offsetX - dragbar.clientWidth) + 'px';
  }
});

document.addEventListener('mouseup', function () {
  dragging = false;
  document.body.style.cursor = 'default';
});




// 文件上传
// 为按钮添加点击事件监听器

customButton.addEventListener('click', function () {
  fileInput.click();
});


document.getElementById('fileInput').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async function (e) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(e.target.result, "text/xml");
      displayXML(xmlDoc);
      await buildRibbon(xmlDoc);
      createTreeFromXML(xmlDoc, document.getElementById('xmlTree'));
      // displayXMLTree(xmlDoc.documentElement, document.getElementById('xmlTree'));
    };
    reader.readAsText(file);
  }
});


function displayXML(xml) {
  const output = document.getElementById('codeOutput');
  const serializer = new XMLSerializer();
  const xmlStr = serializer.serializeToString(xml);
  output.textContent = xmlStr;
  Prism.highlightElement(output);

}



async function buildRibbon(xmlDoc) {
  const ribbon = document.getElementById('ribbon');
  const tabnav = document.getElementById('tabnav');
  let label;
  let image;
  let size;

  // Clear existing content
  ribbon.innerHTML = '';
  tabnav.innerHTML = '';

  const tabs = xmlDoc.getElementsByTagName('tab');
  const ul = document.createElement('ul');

  for (const tab of tabs) {

    //tab
    const tabDiv = document.createElement('div');
    const li = document.createElement('li');
    const uuidv = uuid();
    tabDiv.classList.add('tab');
    tabDiv.classList.add('active');
    label = tab.getAttribute('idMso');
    if (label) {
      label = await getDataById(label, "tab");
    } else {
      label = tab.getAttribute('label') || "";
    }

    tabDiv.setAttribute('data-label', label);
    tabDiv.setAttribute('data-uuid', uuidv);
    li.setAttribute('data-uuid', uuidv);
    li.textContent = label;

    //group
    const groups = tab.getElementsByTagName('group');
    for (const group of groups) {
      const groupDiv = document.createElement('div');
      groupDiv.classList.add('group');

      label = group.getAttribute('getLabel');
      if (label) {
        label = await getDataById(group.getAttribute('id'), "label");
      } else {
        label = group.getAttribute('label') || "";
      }

      groupDiv.setAttribute('data-label', label);

      //groupchild
      const children = group.children;
      for (const child of children) {
        buildMenu(child, groupDiv);
      }
      ul.appendChild(li);
      tabDiv.appendChild(groupDiv);
    }

    tabnav.appendChild(ul);
    ribbon.appendChild(tabDiv);
    buildRibbonImage();
  }
}


// 创建菜单项的通用函数
function createMenuItem(xmlNode, parentElement) {
  const dataId = xmlNode.getAttribute('id') || xmlNode.getAttribute('idMso') || "";
  const dataLabel = xmlNode.getAttribute('label') || xmlNode.getAttribute('getLabel') || xmlNode.getAttribute('getTitle');
  const dataImage = xmlNode.getAttribute('image') || xmlNode.getAttribute('imageMso');

  console.log("xmlNode", xmlNode);
  console.log("dataId", dataId);
  console.log("dataLabel", dataLabel);
  console.log("dataImage", dataImage);

  let menuItem;
  if (xmlNode.tagName === 'menu') {
    menuItem = createSubMenu(xmlNode, parentElement);
  } else if (xmlNode.tagName === 'button') {
    menuItem = createButton(xmlNode, parentElement);
  } else if (xmlNode.tagName === 'menuSeparator') {
    menuItem = createMenuSeparator(xmlNode, parentElement);
  }

  console.log("menuItem", menuItem);
  menuItem.setAttribute('data-id', dataId);
  menuItem.setAttribute('data-label', dataLabel);
  menuItem.setAttribute('data-image', dataImage);

  return menuItem;
}



// 创建子菜单的函数
function createSubMenu(xmlMenuNode, parentElement) {
  const menuDiv = document.createElement('div');
  menuDiv.classList.add('menu-submenu');

  // 获取菜单的标签名和ID
  const dataId = xmlMenuNode.getAttribute('id') || xmlMenuNode.getAttribute('idMso');
  const dataLabel = xmlMenuNode.getAttribute('label') || xmlMenuNode.getAttribute('getLabel') || xmlMenuNode.getAttribute('getTitle');

  // 创建菜单标题
  const menuTitle = document.createElement('div');
  menuTitle.classList.add('menu-title');
  menuTitle.textContent = dataLabel;
  menuDiv.appendChild(menuTitle);

  // 创建菜单内容容器
  const menuContent = document.createElement('div');
  menuContent.classList.add('menu-content');
  menuDiv.appendChild(menuContent);

  // 递归地为子菜单中的每个子节点创建菜单项
  for (let i = 0; i < xmlMenuNode.childNodes.length; i++) {
    const childNode = xmlMenuNode.childNodes[i];
    if (childNode.nodeType === 1) { // 确保是元素节点
      createMenuItem(childNode, menuContent); // 递归调用 createMenuItem
    }
  }

  // 将子菜单添加到父元素
  parentElement.appendChild(menuDiv);
}

function createButton(xmlNode, parentElement) {

  const button = document.createElement('button');
  console.log("xmlNode1", xmlNode);
  const buttonText = xmlNode.getAttribute('label') || xmlNode.getAttribute('id') || 'Button';
  button.textContent = buttonText;
  parentElement.appendChild(button);
  return parentElement;
}


// 构建菜单的递归函数
function buildMenu(xmlNode, parentElement) {
  for (let i = 0; i < xmlNode.childNodes.length; i++) {
    const childNode = xmlNode.childNodes[i];
    if (childNode.nodeType === 1) {
      const menuItem = createMenuItem(childNode, parentElement);  // 普通按钮
      if (childNode.tagName === 'menu') {
        buildMenu(childNode, menuItem.lastElementChild); // 递归构建子菜单
      }
    }
  }
}


// 创建菜单分隔符的函数
function createMenuSeparator(xmlNode, parentElement) {

}

async function buildRibbon_1(xmlDoc) {
  const ribbon = document.getElementById('ribbon');
  const tabnav = document.getElementById('tabnav');
  let label;
  let image;
  let size;

  // Clear existing content
  ribbon.innerHTML = '';
  tabnav.innerHTML = '';

  const tabs = xmlDoc.getElementsByTagName('tab');
  const ul = document.createElement('ul');

  for (const tab of tabs) {
    const tabDiv = document.createElement('div');
    const li = document.createElement('li');
    const uuidv = uuid();
    tabDiv.classList.add('tab');
    label = tab.getAttribute('idMso');
    if (label) {
      label = await getDataById(label, "tab");
    } else {
      label = tab.getAttribute('label') || "";
    }

    tabDiv.setAttribute('data-label', label);
    tabDiv.setAttribute('data-uuid', uuidv);
    li.setAttribute('data-uuid', uuidv);
    li.textContent = label;

    const groups = tab.getElementsByTagName('group');
    for (const group of groups) {
      // add group
      const groupDiv = document.createElement('div');
      groupDiv.classList.add('group');

      label = group.getAttribute('getLabel');
      if (label) {
        label = await getDataById(group.getAttribute('id'), "label");
      } else {
        label = group.getAttribute('label') || "";
      }

      groupDiv.setAttribute('data-label', label);

      // add button
      const children = group.children;
      for (const child of children) {
        const buttonDiv = document.createElement('div');

        // label
        label = child.getAttribute('getLabel');
        if (label) {
          label = await getDataById(child.getAttribute('id'), "label");
        } else {
          label = child.getAttribute('label') || child.getAttribute('idMso') || "";
        }

        // image
        image = child.getAttribute('getImage');
        if (image) {
          image = await getDataById(child.getAttribute('id'), "image");
        } else {
          image = child.getAttribute('imageMso') || child.getAttribute('image') || "";
        }

        buttonDiv.classList.add(child.tagName);

        size = child.getAttribute('size');
        if (size === "large") {
          buttonDiv.classList.add('large');
        }

        buttonDiv.setAttribute('data-image', image);
        buttonDiv.setAttribute('draggable', 'true');
        buttonDiv.setAttribute('data-uuid', uuid());

        // check
        if (child.tagName === "checkBox") {
          const input = document.createElement('input');
          const Elabel = document.createElement('label');
          input.type = "checkbox";
          Elabel.textContent = label;
          buttonDiv.appendChild(input);
          buttonDiv.appendChild(Elabel);
        } else {
          buttonDiv.textContent = label;
        }

        if (child.tagName === "menu") {
          createMenuElement(child, buttonDiv);
        }

        // check
        if (child.tagName === "splitButton") {
          const toggleButton = child.querySelector('toggleButton');

          if (toggleButton) {
            const splitButton_children = child.children;
            for (const splitButton_child of splitButton_children) {
              const div2 = document.createElement('div');
              div2.classList.add(splitButton_child.tagName);
              div2.setAttribute('data-label', splitButton_child.getAttribute('label'));
              div2.setAttribute('data-uuid', uuid());
              buttonDiv.appendChild(div2);

            }
          }
          const menu = child.querySelector('toggleButton');
          if (toggleButton) {


          }




        } else {

        }

        groupDiv.appendChild(buttonDiv);
      }
      ul.appendChild(li);
      tabDiv.appendChild(groupDiv);
    }

    tabnav.appendChild(ul);
    ribbon.appendChild(tabDiv);
    buildRibbonImage();
  }
}


function createMenuElement(xmlMenuNode, parentElement) {
  let dataid;
  let datalabel;
  let dataimage;

  // 遍历menu节点中的所有子节点
  for (let i = 0; i < xmlMenuNode.childNodes.length; i++) {
    const childNode = xmlMenuNode.childNodes[i];
    if (childNode.nodeType === 1) { // 确保是元素节点
      let childElement;

      dataid = childNode.getAttribute('id') || childNode.getAttribute('idMso');
      datalabel = childNode.getAttribute('label') || childNode.getAttribute('getLabel') || childNode.getAttribute('getTitle');
      dataimage = childNode.getAttribute('image') || childNode.getAttribute('imageMso');



      // 如果是子菜单，递归创建子菜单
      if (childNode.tagName === 'menu') {
        // 如果是子菜单，递归创建子菜单
        childElement = document.createElement('ul');
        const summary = document.createElement('li');
        summary.textContent = childNode.getAttribute('label');

        const size = childNode.getAttribute('size');
        if (size === "large") {
          childElement.classList.add('large');
        }

        childElement.appendChild(summary);
        const contentDiv = document.createElement('div');
        contentDiv.setAttribute('class', 'submenu-content');
        childElement.appendChild(contentDiv);
        createMenuElement(childNode, contentDiv); // 递归调用

      } else if (childNode.tagName === 'button') {
        childElement = document.createElement('button');
        childElement.textContent = childNode.getAttribute('label');

      } else if (childNode.tagName === 'menuSeparator') {
        childElement = document.createElement('div');
        childElement.classList.add('menuSeparator');
      }

      if (childElement) {
        parentElement.appendChild(childElement);
      }
    }
  }
}




function createTreeFromXML(xmlNode, parentElement) {
  // 为每个节点创建一个details元素
  const detailsEl = document.createElement('details');
  parentElement.appendChild(detailsEl);

  // 为每个节点创建一个summary元素，并设置其文本内容
  const summaryEl = document.createElement('summary');
  summaryEl.textContent = xmlNode.nodeName;
  summaryEl.className = 'tree-item'; // 添加CSS类
  detailsEl.appendChild(summaryEl);

  // 遍历所有子节点
  Array.from(xmlNode.childNodes).forEach(childNode => {
    if (childNode.nodeType === 1) { // 确保是元素节点
      createTreeFromXML(childNode, detailsEl); // 递归调用函数
    }
  });


  // 拖拽

  // 获取所有的树项
  const treeItems = document.querySelectorAll('.tree-item');

  // 使每个树项可拖拽
  treeItems.forEach(item => {
    item.setAttribute('draggable', 'true');

    item.addEventListener('dragstart', function (e) {
      // 存储当前拖拽项的ID
      this.style.opacity = '0.4'; // 改变透明度，表示正在拖拽
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', this.innerHTML);
    });

    item.addEventListener('dragend', function () {
      this.style.opacity = '1'; // 拖拽结束后恢复透明度
    });
  });

  // 给树容器添加拖拽事件
  const treeContainer = document.querySelector('.tree');
  treeContainer.addEventListener('dragover', function (e) {
    e.preventDefault(); // 允许在元素上放置
    e.dataTransfer.dropEffect = 'move'; // 显示移动效果
  });

  treeContainer.addEventListener('drop', function (e) {
    e.preventDefault();
    const dragItem = document.querySelector('.dragging'); // 找到当前正在拖拽的项
    if (dragItem) {
      // 插入到放置位置
      this.appendChild(dragItem);
    }
  });

  // 给树项添加拖拽进入和离开事件
  treeItems.forEach(item => {
    item.addEventListener('dragenter', function () {
      // 可以添加一些视觉效果
    });

    item.addEventListener('dragleave', function () {
      // 可以添加一些视觉效果
    });
  });



}


// function displayXMLTree(xmlNode, parentElement) {
//   const details = document.createElement('details');
//   const summary = document.createElement('summary');


//   let nodeId = xmlNode.getAttribute('id') || xmlNode.getAttribute('msoid') || ''; // 设置默认值为 'DefaultID'

//   summary.textContent = xmlNode.nodeName + (nodeId ? " (" + nodeId + ")" : ""); // 添加节点名称和ID（如果有）

//   details.appendChild(summary);

//   parentElement.appendChild(details);

//   if (xmlNode.childNodes.length > 0) {
//     const nestedDetails = document.createElement('details'); // 嵌套的details
//     const nestedSummary = document.createElement('summary');
//     const span = document.createElement('span');
//     span.classList.add('tree-item');
//     nestedSummary.appendChild(span);

//     nestedDetails.appendChild(nestedSummary);
//     summary.appendChild(nestedDetails); // 将嵌套的details添加到summary中

//     for (let i = 0; i < xmlNode.childNodes.length; i++) {
//       if (xmlNode.childNodes[i].nodeType === 1) { // Node.ELEMENT_NODE
//         displayXMLTree(xmlNode.childNodes[i], nestedSummary); // 递归调用函数，添加到嵌套的summary中
//       }
//     }
//   }

//   summary.addEventListener('click', function (event) {
//     event.stopPropagation(); // 阻止事件冒泡
//     // highlightXMLNode(xmlNode.nodeName);
//     console.log(xmlNode.nodeName);

//     if (xmlNode.getAttribute('id')) {
//       nodeId = xmlNode.getAttribute('id'); // 获取 id 属性值
//     } else if (xmlNode.getAttribute('msoid')) {
//       nodeId = xmlNode.getAttribute('msoid'); // 获取 msoid 属性值
//     }
//     // highlightXMLNode(nodeId);
//     console.log(nodeId);
//   });

//   // 移除 mouseover 和 mouseout 事件监听器，因为它们与 <details>/<summary> 结构不兼容
//   // 如果需要类似的功能，可以考虑使用 details 的 open 事件
// }


// 设置图标
buildRibbonImage()

function buildRibbonImage() {
  // 获取所有带有 data-image 属性的按钮
  var buttons = document.querySelectorAll('.button[data-image]');

  // 遍历每个按钮
  buttons.forEach(function (button) {
    // 获取按钮的 data-image 值
    var imageName = button.getAttribute('data-image');

    // 设置按钮的背景图像
    button.style.backgroundImage = 'url(icon/' + imageName + '.png)';
  });
}


