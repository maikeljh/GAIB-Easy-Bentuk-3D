document.addEventListener("DOMContentLoaded", function () {
  let cube_rotation = 0.0;
  let pyramid_rotation = 0.0;
  let delta1 = 0;
  let delta2 = 0;

  // Step 1 : Shaders
  // Vertex shader program
  const vertex_shader_source = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program
  const fragment_shader_source = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Step 2 : Initializing The Shaders
  const create_shader_program = (
    gl,
    vertex_shader_source,
    fragment_shader_source
  ) => {
    // Creates vertex and fragment shader
    const vertex_shader = load_shader(
      gl,
      gl.VERTEX_SHADER,
      vertex_shader_source
    );
    const fragment_shader = load_shader(
      gl,
      gl.FRAGMENT_SHADER,
      fragment_shader_source
    );

    // Create the shader program
    const shader_program = gl.createProgram();

    // Attach shaders to program
    gl.attachShader(shader_program, vertex_shader);
    gl.attachShader(shader_program, fragment_shader);

    // Link together
    gl.linkProgram(shader_program);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS)) {
      alert(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
          shader_program
        )}`
      );
      return null;
    }

    // Return shader program
    return shader_program;
  };

  // Function to load shader
  const load_shader = (gl, type, source) => {
    // Create object shader
    const shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(
        `An error occurred compiling the shaders: ${gl.getShaderInfoLog(
          shader
        )}`
      );
      gl.deleteShader(shader);
      return null;
    }

    // Return shader
    return shader;
  };

  // Step 4 : Create buffer to contain vertex
  const create_buffers_cube = (gl) => {
    // 1. Initialize buffer position
    const position_buffer = create_buffer_position_cube(gl);

    // 2. Initialize buffer colors
    const color_buffer = create_buffer_color(gl);

    // 3. Initiailize buffer index
    const index_buffer = create_buffer_index(gl);

    return {
      position: position_buffer,
      color: color_buffer,
      indices: index_buffer,
    };
  };

  const create_buffers_pyramid = (gl) => {
    // 1. Initialize buffer position
    const position_buffer = create_buffer_position_pyramid(gl);

    // 2. Initialize buffer colors
    const color_buffer = create_buffer_color(gl);

    // 3. Initiailize buffer index
    const index_buffer = create_buffer_index(gl);

    return {
      position: position_buffer,
      color: color_buffer,
      indices: index_buffer,
    };
  };

  // Function to create buffer position
  const create_buffer_position_pyramid = (gl) => {
    // Create a buffer for the square's positions.
    const position_buffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);

    const positions = [
      // Pyramid vertices
      // Front face
      0.0, 1.0, 0.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
      // Back face
      0.0, 1.0, 0.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0,
      // Left face
      0.0, 1.0, 0.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
      // Tes
      0.0, 1.0, 0.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
      // Right face
      0.0, 1.0, 0.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0,
      // Tes
      1.0, -1.0, -1.0,
    ];

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return position_buffer;
  };

  // Function to create buffer position
  const create_buffer_position_cube = (gl) => {
    // Create a buffer for the square's positions.
    const position_buffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);

    const positions = [
      // Front face
      -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

      // Back face
      -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

      // Top face
      -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

      // Right face
      1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

      // Left face
      -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
    ];

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return position_buffer;
  };

  // Function to create buffer color
  const create_buffer_color = (gl) => {
    const face_colors = [
      [1.0, 0.0, 0.0, 1.0], // Red
      [0.0, 1.0, 0.0, 1.0], // Green
      [0.0, 0.0, 1.0, 1.0], // Blue
      [1.0, 1.0, 0.0, 1.0], // Yellow
    ];

    // Convert the array of colors into a table for all the vertices.
    var colors = [];

    for (var j = 0; j < face_colors.length; ++j) {
      const c = face_colors[j];
      // Repeat each color four times for the four vertices of the face
      colors = colors.concat(c, c, c, c);
    }

    const color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return color_buffer;
  };

  // Function to create buffer index
  const create_buffer_index = (gl) => {
    const index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

    const indices = [
      0,
      1,
      2,
      0,
      2,
      3, // front
      4,
      5,
      6,
      4,
      6,
      7, // back
      8,
      9,
      10,
      8,
      10,
      11, // top
      12,
      13,
      14,
      12,
      14,
      15, // bottom
      16,
      17,
      18,
      16,
      18,
      19, // right
      20,
      21,
      22,
      20,
      22,
      23, // left
    ];

    // Now send the element array to GL
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW
    );

    return index_buffer;
  };

  // Step 5 : Rendering The Scene
  const draw_scene_cube = (gl, program_info, buffers, cube_rotation) => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
    const field_of_view = (45 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const z_near = 0.1;
    const z_far = 100.0;
    const projection_matrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projection_matrix, field_of_view, aspect, z_near, z_far);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const model_view_matrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    mat4.translate(
      model_view_matrix, // destination matrix
      model_view_matrix, // matrix to translate
      [-0.0, 0.0, -6.0]
    ); // amount to translate

    mat4.rotate(
      model_view_matrix, // destination matrix
      model_view_matrix, // matrix to rotate
      cube_rotation, // amount to rotate in radians
      [0, 0, 1]
    ); // axis to rotate around (Z)
    mat4.rotate(
      model_view_matrix, // destination matrix
      model_view_matrix, // matrix to rotate
      cube_rotation * 0.7, // amount to rotate in radians
      [0, 1, 0]
    ); // axis to rotate around (Y)
    mat4.rotate(
      model_view_matrix, // destination matrix
      model_view_matrix, // matrix to rotate
      cube_rotation * 0.3, // amount to rotate in radians
      [1, 0, 0]
    ); // axis to rotate around (X)

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertex_position attribute.
    set_position_attribute(gl, buffers, program_info);

    set_color_attribute(gl, buffers, program_info);

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Tell WebGL to use our program when drawing
    gl.useProgram(program_info.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
      program_info.uniform_locations.projection_matrix,
      false,
      projection_matrix
    );

    gl.uniformMatrix4fv(
      program_info.uniform_locations.model_view_matrix,
      false,
      model_view_matrix
    );

    // Draw elements
    const vertex_count = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertex_count, type, offset);
  };

  const draw_scene_pyramid = (gl, program_info, buffers, pyramid_rotation) => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
    const field_of_view = (45 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const z_near = 0.1;
    const z_far = 100.0;
    const projection_matrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projection_matrix, field_of_view, aspect, z_near, z_far);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const model_view_matrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    mat4.translate(
      model_view_matrix, // destination matrix
      model_view_matrix, // matrix to translate
      [-0.0, 0.0, -6.0]
    ); // amount to translate

    mat4.rotate(
      model_view_matrix, // destination matrix
      model_view_matrix, // matrix to rotate
      pyramid_rotation, // amount to rotate in radians
      [0, 0, 1]
    ); // axis to rotate around (Z)
    mat4.rotate(
      model_view_matrix, // destination matrix
      model_view_matrix, // matrix to rotate
      pyramid_rotation * 0.7, // amount to rotate in radians
      [0, 1, 0]
    ); // axis to rotate around (Y)
    mat4.rotate(
      model_view_matrix, // destination matrix
      model_view_matrix, // matrix to rotate
      pyramid_rotation * 0.3, // amount to rotate in radians
      [1, 0, 0]
    ); // axis to rotate around (X)

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertex_position attribute.
    set_position_attribute(gl, buffers, program_info);

    set_color_attribute(gl, buffers, program_info);

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Tell WebGL to use our program when drawing
    gl.useProgram(program_info.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
      program_info.uniform_locations.projection_matrix,
      false,
      projection_matrix
    );

    gl.uniformMatrix4fv(
      program_info.uniform_locations.model_view_matrix,
      false,
      model_view_matrix
    );

    // Draw elements
    const vertex_count = 21;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertex_count, type, offset);
  };

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertex_position attribute.
  const set_position_attribute = (gl, buffers, program_info) => {
    const num_components = 3;
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and num_components above
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      program_info.attribute_locations.vertex_position,
      num_components,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(
      program_info.attribute_locations.vertex_position
    );
  };

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertex_color attribute.
  const set_color_attribute = (gl, buffers, program_info) => {
    const num_components = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
      program_info.attribute_locations.vertex_color,
      num_components,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(program_info.attribute_locations.vertex_color);
  };

  const draw_cube = () => {
    // Get first canva HTML element
    const first_canvas = document.querySelector("#glcanvas");

    // Initialize GL
    const gl = first_canvas.getContext("webgl");

    // Check if browser supports WebGL or not
    if (gl === null) {
      alert("Error! Browser may not support WebGL");
      return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Initialize a shader program
    const shader_program = create_shader_program(
      gl,
      vertex_shader_source,
      fragment_shader_source
    );

    // Store Program Information
    const program_info = {
      program: shader_program,
      attribute_locations: {
        vertex_position: gl.getAttribLocation(
          shader_program,
          "aVertexPosition"
        ),
        vertex_color: gl.getAttribLocation(shader_program, "aVertexColor"),
      },
      uniform_locations: {
        projection_matrix: gl.getUniformLocation(
          shader_program,
          "uProjectionMatrix"
        ),
        model_view_matrix: gl.getUniformLocation(
          shader_program,
          "uModelViewMatrix"
        ),
      },
    };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    const buffers = create_buffers_cube(gl);
    let then = 0;

    // Draw the scene repeatedly
    const render = (now) => {
      // convert to miliseconds
      now *= 0.001;

      // delta1 and then to rotate cube continously
      delta1 = now - then;
      then = now;

      // Draw scene
      draw_scene_cube(gl, program_info, buffers, cube_rotation);

      // Update radian
      cube_rotation += delta1;

      // Render animation continously
      requestAnimationFrame(render);
    };

    // Render animation cube
    requestAnimationFrame(render);
  };

  const draw_pyramid = () => {
    // Get second canva HTML element
    const second_canvas = document.querySelector("#glcanvas2");

    // Initialize GL
    const gl = second_canvas.getContext("webgl");

    // Check if browser supports WebGL or not
    if (gl === null) {
      alert("Error! Browser may not support WebGL");
      return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Initialize a shader program
    const shader_program = create_shader_program(
      gl,
      vertex_shader_source,
      fragment_shader_source
    );

    // Store Program Information
    const program_info = {
      program: shader_program,
      attribute_locations: {
        vertex_position: gl.getAttribLocation(
          shader_program,
          "aVertexPosition"
        ),
        vertex_color: gl.getAttribLocation(shader_program, "aVertexColor"),
      },
      uniform_locations: {
        projection_matrix: gl.getUniformLocation(
          shader_program,
          "uProjectionMatrix"
        ),
        model_view_matrix: gl.getUniformLocation(
          shader_program,
          "uModelViewMatrix"
        ),
      },
    };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    const buffers = create_buffers_pyramid(gl);
    let then = 0;

    // Draw the scene repeatedly
    const render = (now) => {
      // convert to miliseconds
      now *= 0.001;

      // delta2 and then to rotate cube continously
      delta2 = now - then;
      then = now;

      // Draw scene
      draw_scene_pyramid(gl, program_info, buffers, pyramid_rotation);

      // Update radian
      pyramid_rotation += delta2;

      // Render animation continously
      requestAnimationFrame(render);
    };

    // Render animation cube
    requestAnimationFrame(render);
  };

  // Draw cube
  draw_cube();

  // Draw pyramid
  draw_pyramid();
});
