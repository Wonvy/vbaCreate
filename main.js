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




var labelsData = null;
var imagesData = null;

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
    const [labels, images] = await Promise.all([
      fetchData('/json/getLabel.json'),
      fetchData('/json/getImage.json')
    ]);

    // 赋值给全局变量
    labelsData = labels;
    imagesData = images;
  } catch (error) {
    console.error('Failed to load data:', error);
    labelsData = null;
    imagesData = null;
  }
}

async function getDataById(controlId, type) {
  // 确保数据已加载
  if (!labelsData || !imagesData) {
    await loadData();
  }

  // 根据类型返回数据
  if (type === 'label') {
    if (labelsData) {
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
  } else {
    console.error('Invalid type specified. Use "label" or "image".');
    return null;
  }
}



loadData();




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
    reader.onload = function (e) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(e.target.result, "text/xml");
      displayXML(xmlDoc);
      buildRibbon(xmlDoc);
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


function buildRibbon(xmlDoc) {
  const ribbon = document.getElementById('ribbon');
  let lable;
  let image;
  let size;

  ribbon.innerHTML = ''; // Clear existing content

  const tabs = xmlDoc.getElementsByTagName('tab');
  Array.from(tabs).forEach(tab => {
    const tabDiv = document.createElement('div');
    tabDiv.classList.add('tab');
    lable = tab.getAttribute('idMso');

    const groups = tab.getElementsByTagName('group');
    Array.from(groups).forEach(group => {
      //add group
      const groupDiv = document.createElement('div');
      groupDiv.classList.add('group');

      lable = group.getAttribute('getLabel');
      if (lable !== null && lable !== undefined && lable !== '') {
        lable = getDataById(lable, "label");
      } else {
        lable = group.getAttribute('label') || ""
      }

      groupDiv.setAttribute('data-lable', lable);

      // add button
      const children = group.children;
      Array.from(children).forEach(child => {
        const buttonDiv = document.createElement('div');



        //lable
        lable = child.getAttribute("image", 'getLabel');
        console.log(child)
        if (lable !== null && lable !== undefined && lable !== '') {
          lable = getDataById(child.getAttribute('id'), "image");
        } else {
          lable = child.getAttribute('label') || child.getAttribute('idMso') || ""
        }

        //image
        image = child.getAttribute('getImage');
        console.log(child.getAttribute('getImage'));
        console.log(image);
        if (image !== null && image !== undefined && image !== '') {
          image = getDataById(child.getAttribute('id'), "image");
        } else {
          image = child.getAttribute('imageMso') || child.getAttribute('image') || ""
        }

        buttonDiv.classList.add(child.tagName);

        size = child.getAttribute('size')
        if (size == "large") {
          buttonDiv.classList.add('large');
        }





        buttonDiv.setAttribute('data-image', image);
        buttonDiv.setAttribute('draggable', 'true');
        buttonDiv.setAttribute('data-uuid', uuid());

        // check
        if (child.tagName == "checkBox") {
          const input = document.createElement('input');
          const label = document.createElement('label');
          input.type = "checkbox";
          label.textContent = lable;
          // input.id = "inputId";
          // label.id = "labelId";
          buttonDiv.appendChild(input);
          buttonDiv.appendChild(label);
        } else {
          buttonDiv.textContent = lable;
        }

        groupDiv.appendChild(buttonDiv);

      });

      tabDiv.appendChild(groupDiv);
    });

    ribbon.appendChild(tabDiv);
    buildRibbonImage()
  });
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


