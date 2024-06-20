let dragging = false;

document.getElementById('dragbar').addEventListener('mousedown', function (e) {
  dragging = true;
  console.log('dragging started');
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


document.getElementById('fileInput').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(e.target.result, "text/xml");
      displayXML(xmlDoc);
      displayXMLTree(xmlDoc);
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

function displayXMLTree(xml) {
  const treeContainer = document.getElementById('treeContainer');
  treeContainer.innerHTML = '';
  const ul = document.createElement('ul');
  ul.classList.add('tree');
  buildTree(xml.documentElement, ul, true); // Initially display all top-level items
  treeContainer.appendChild(ul);
}

function buildTree(node, parentElement, isRoot = false) {
  const li = document.createElement('li');
  const span = document.createElement('span');
  span.textContent = node.nodeName;

  const toggle = document.createElement('span');
  toggle.classList.add('toggle');
  li.appendChild(toggle);
  li.appendChild(span);

  const ul = document.createElement('ul');
  Array.from(node.childNodes).forEach(child => {
    if (child.nodeType === 1) { // element node
      buildTree(child, ul);
    } else if (child.nodeType === 3 && child.nodeValue.trim() !== '') { // text node
      const textLi = document.createElement('li');
      textLi.textContent = child.nodeValue.trim();
      ul.appendChild(textLi);
    }
  });

  if (ul.children.length > 0) {
    li.appendChild(ul);
  } else {
    toggle.style.visibility = 'hidden';
  }

  if (isRoot) {
    li.classList.add('expanded'); // Expand all top-level items
  }

  li.addEventListener('click', function (event) {
    event.stopPropagation();
    this.classList.toggle('expanded');
  });

  parentElement.appendChild(li);
}

