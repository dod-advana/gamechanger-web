UPDATE tutorial_overlays
SET new_user_tutorial_json = '{
    "components": [
        {
            "component_name": "Gamechanger Title",
            "step_number": 1,
            "step_text": "GAMECHANGER offers a scalable solution with a comprehensive corpus, comprising a single, trusted repository of all DoD governing requirements built using AI-enabled technologies.",
            "type": "input",
            "placement": "auto",
            "title": "Evidence-Based Policy; Data-Driven Decisions"
        },
        {
            "component_name": "Search Bar",
            "step_number": 2,
            "step_text": "Search across our comprehensive policy corpus with simple or complex queries.",
            "title": "SEARCH",
            "type": "display"
        },
        {
            "component_name": "Search Input",
            "step_number": 3,
            "step_text": "Build your queries with quotes to define exact phrases, plain keywords, or combine terms with boolean operators (AND, OR). For example \"artificial intelligence\" and president.",
            "input_ID": "gcSearchInput",
            "input_text": "\"artificial intelligence\" and president",
            "button_ID": "gcSearchButton",
            "input": true,
            "click_button": true,
            "title": "STRUCTURE",
            "type": "input"
        },
        {
            "component_name": "Search Result Card",
            "step_number": 4,
            "step_text": "Our default Grid View displays results in categories. Matched terms are highlighted in each snippet in interactive cards. Click \"Open\" to access the full PDF, \"Details\" to find more information about referenced policies, or \"More\" to view metadata extracted from each result.",
            "type": "display",
            "parent": "Search Results Section",
            "disableScrolling": true,
            "placement": "right",
            "title": "Results"
        },
        {
            "component_name": "Advanced Settings",
            "step_number": 5,
            "title": "Filters",
            "step_text": "Tailor queries with advanced filters.",
            "button_ID": "gcAdvancedSettings",
            "click_button": false,
            "type": "display"
        },
        {
            "component_name": "Change View",
            "step_number": 6,
            "title": "View Dropdown",
            "step_text": "Explore other views for different ways to analyze results.",
            "type": "display"
        },
        {
            "component_name": "Share Search",
            "step_number": 7,
            "title": "Share Your Search",
            "step_text": "Easily send tailored search results to colleagues by clicking here for a shareable link.",
            "click_button": false,
            "button_ID": "gcShareSearch",
            "type": "button"
        },
        {
            "component_name": "Open Selected Documents Drawer",
            "step_number": 8,
            "title": "Export",
            "step_text": "Export all or selected results in csv, json, or pdf formats.",
            "button_ID": "gcOpenSelectedDocsDrawer",
            "click_button": false,
            "type": "button"
        },
        {
            "component_name": "Slide-out Menu",
            "step_number": 9,
            "step_text": "Check out our menu for additional features, capabilities, and support.",
            "type": "display",
            "placement": "right",
            "title": "Slide-out Menu"
        },
        {
            "component_name": "User Guide",
            "step_number": 10,
            "title": "More Help",
            "step_text": "Want more help? Explore our User Guide here for more information on each of our features.",
            "button_ID": "gcUserGuide",
            "click_button": false,
            "type": "button"
        }
    ]
}',
current_tutorial_json = '{
    "components": [
        {
            "component_name": "Gamechanger Title",
            "step_number": 1,
            "step_text": "GAMECHANGER offers a scalable solution with a comprehensive corpus, comprising a single, trusted repository of all DoD governing requirements built using AI-enabled technologies.",
            "type": "input",
            "placement": "auto",
            "title": "Evidence-Based Policy; Data-Driven Decisions"
        },
        {
            "component_name": "Search Bar",
            "step_number": 2,
            "step_text": "Search across our comprehensive policy corpus with simple or complex queries.",
            "title": "SEARCH",
            "type": "display"
        },
        {
            "component_name": "Search Input",
            "step_number": 3,
            "step_text": "Build your queries with quotes to define exact phrases, plain keywords, or combine terms with boolean operators (AND, OR). For example \"artificial intelligence\" and president.",
            "input_ID": "gcSearchInput",
            "input_text": "\"artificial intelligence\" and president",
            "button_ID": "gcSearchButton",
            "input": true,
            "click_button": true,
            "title": "STRUCTURE",
            "type": "input"
        },
        {
            "component_name": "Search Result Card",
            "step_number": 4,
            "step_text": "Our default Grid View displays results in categories. Matched terms are highlighted in each snippet in interactive cards. Click \"Open\" to access the full PDF, \"Details\" to find more information about referenced policies, or \"More\" to view metadata extracted from each result.",
            "type": "display",
            "parent": "Search Results Section",
            "disableScrolling": true,
            "placement": "right",
            "title": "Results"
        },
        {
            "component_name": "Advanced Settings",
            "step_number": 5,
            "title": "Filters",
            "step_text": "Tailor queries with advanced filters.",
            "button_ID": "gcAdvancedSettings",
            "click_button": false,
            "type": "display"
        },
        {
            "component_name": "Change View",
            "step_number": 6,
            "title": "View Dropdown",
            "step_text": "Explore other views for different ways to analyze results.",
            "type": "display"
        },
        {
            "component_name": "Share Search",
            "step_number": 7,
            "title": "Share Your Search",
            "step_text": "Easily send tailored search results to colleagues by clicking here for a shareable link.",
            "click_button": false,
            "button_ID": "gcShareSearch",
            "type": "button"
        },
        {
            "component_name": "Open Selected Documents Drawer",
            "step_number": 8,
            "title": "Export",
            "step_text": "Export all or selected results in csv, json, or pdf formats.",
            "button_ID": "gcOpenSelectedDocsDrawer",
            "click_button": false,
            "type": "button"
        },
        {
            "component_name": "Slide-out Menu",
            "step_number": 9,
            "step_text": "Check out our menu for additional features, capabilities, and support.",
            "type": "display",
            "placement": "right",
            "title": "Slide-out Menu"
        },
        {
            "component_name": "User Guide",
            "step_number": 10,
            "title": "More Help",
            "step_text": "Want more help? Explore our User Guide here for more information on each of our features.",
            "button_ID": "gcUserGuide",
            "click_button": false,
            "type": "button"
        }
    ]
}'
WHERE app_name = 'gamechanger';
