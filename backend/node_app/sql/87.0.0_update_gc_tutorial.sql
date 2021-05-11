delete from tutorial_overlays where app_name = 'Gamechanger';

create or replace function gcNewUserTutorialJSON()
returns json as
$$ 
    declare x json;
    begin
        x:= '{
    "components": [
        {
            "component_name": "Gamechanger Title",
            "step_number": 1,
            "step_text": "GAMECHANGER offers a scalable solution with an authoritative corpus, comprising a single, trusted repository of all DoD governing requirements built using AI-enabled technologies.",
            "type": "input",
            "placement": "auto",
            "title": "Evidence-Based Policy; Data-Driven Decisions"
        },
        {
            "component_name": "Search Bar",
            "step_number": 2,
            "step_text": "Search across our authoritative policy corpus with simple or complex queries.",
            "title": "SEARCH",
            "type": "display"
        },
        {
            "component_name": "Advanced Settings",
            "step_number": 3,
            "title": "Advanced Settings",
            "step_text": "Tailor queries with advanced filters.",
            "button_ID": "gcAdvancedSettings",
            "click_button": false,
            "type": "display"
        },
        {
            "component_name": "Search Input",
            "step_number": 4,
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
            "step_number": 5,
            "step_text": "Our default Card View displays results in the form of interactive cards. Matched terms are highlighted in each snippet. Click \"Open\" to access the full PDF or \"See More\" to view metadata extracted from each result.",
            "type": "display",
            "parent": "Search Results Section",
            "disableScrolling": true,
            "placement": "right",
            "title": "CARD"
        },
        {
            "component_name": "List View",
            "step_number": 6,
            "title": "List View",
            "step_text": "Find search metrics, including notable organizations and topics, in our List View.",
            "type": "button",
            "button_ID": "gcListView",
            "click_button": false
        },
        {
            "component_name": "Open Graph View",
            "step_number": 7,
            "title": "Graph View",
            "step_text": "The interactive Graph View provides the ability to visualize complex relationships between documents.",
            "click_button": false,
            "button_ID": "gcOpenGraphView",
            "type": "button"
        },
        {
            "component_name": "Open Document Explorer",
            "step_number": 8,
            "title": "Document Explorer",
            "step_text": "The Document Explorer is an information-rich interface through which to analyze your results.",
            "click_button": false,
            "button_ID": "gcOpenDocExplorer",
            "type": "button"
        },
        {
            "component_name": "Share Search",
            "step_number": 9,
            "title": "Share Your Search",
            "step_text": "Easily send tailored search results to colleagues by clicking here for a shareable link.",
            "click_button": false,
            "button_ID": "gcShareSearch",
            "type": "button"
        },
        {
            "component_name": "Open Selected Documents Drawer",
            "step_number": 10,
            "title": "Export",
            "step_text": "Export all or selected results in csv, json, or pdf formats.",
            "button_ID": "gcOpenSelectedDocsDrawer",
            "click_button": false,
            "type": "button"
        },
        {
            "component_name": "Slide-out Menu",
            "step_number": 11,
            "step_text": "Check out our menu for additional features, capabilities, and support.",
            "type": "display",
            "placement": "right",
            "title": "Slide-out Menu"
        },
        {
            "component_name": "User Guide",
            "step_number": 12,
            "title": "More Help",
            "step_text": "Want more help? Explore our User Guide here for more information on each of our features.",
            "button_ID": "gcUserGuide",
            "click_button": false,
            "type": "button"
        }
    ]
}';
    return x;
END
$$
LANGUAGE plpgsql;

create or replace function gcCurrentTutorialJSON()
returns json as
$$ 
    declare x json;
    begin
        x:= '{
    "components": [
        {
            "component_name": "Gamechanger Title",
            "step_number": 0,
            "step_text": "GAMECHANGER offers an intuitive way to explore and analyze the universe of DoD requirements, codified in external Federal and internal Department guidance documents.",
            "type": "input",
            "placement": "auto",
            "title": "Current Updates"
        },
        {
            "component_name": "Search Bar",
            "step_number": 0,
            "step_text": "Search across all authoritative policy & guidance documents with keywords, phrases, and boolean operators. Explore through the document explorer or export your results.",
            "title": "SEARCH",
            "type": "display"
        },
        {
            "component_name": "Recent Searches",
            "step_number": 0,
            "step_text": "Your most recent searches will appear here for quick access.",
            "title": "Recent Searches",
            "type": "display"
        },
        {
            "component_name": "Search Input",
            "step_number": 0,
            "step_text": "To show the newest additions to Gamechanger, start by making a sample search.",
            "input_ID": "gcSearchInput",
            "input_text": "\"artificial intelligence\" and president",
            "button_ID": "gcSearchButton",
            "input": true,
            "click_button": true,
            "title": "Gamechanger Updates",
            "type": "input"
        },
        {
            "component_name": "Open Document Explorer",
            "step_number": 0,
            "step_text": "The Document Explorer is an information-rich interface through which to analyze your results.",
            "click_button": true,
            "button_ID": "gcOpenDocExplorer",
            "type": "button",
            "title": "EXPLORE"
        },
        {
            "component_name": "Document Explorer Modal",
            "step_number": 0,
            "step_text": "",
            "type": "display",
            "sub_components": 
            [
                {
                    "component_name": "Search Panel",
                    "step_number": 0,
                    "step_text": "List out all of the results of your query with relevant snippets. ",
                    "parent": "Document Explorer Modal",
                    "type": "display",
                    "title": "LIST"
                },
                {
                    "component_name": "Main Panel",
                    "step_number": 0,
                    "step_text": "Interact with the actual document. Open it up and scroll! We give you the entire document to work with.",
                    "type": "display",
                    "parent": "Document Explorer Modal",
                    "title": "DOCUMENT",
                    "placement": "left"
                },
                {
                    "component_name": "Document Data Panel",
                    "step_number": 0,
                    "step_text": "We work hard to provide you with rich meta data about the document.",
                    "type": "display",
                    "parent": "Document Explorer Modal",
                    "title": "EXTRACT"
                },
                {
                    "component_name": "Search Bar",
                    "step_number": 0,
                    "step_text": "",
                    "input_ID": "gcDocExplorerSearchBar",
                    "input_text": "",
                    "input": false,
                    "type": "input",
                    "parent": "Document Explorer Modal"
                },
                {
                    "component_name": "Close Document Explorer",
                    "button_ID": "gcCloseDocumentExplorer",
                    "step_number": 0,
                    "step_text": "Explore on your own. You can open this tutorial again at any time.",
                    "click_button": true,
                    "type": "button",
                    "parent": "Document Explorer Modal",
                    "title": "DISCOVER"
                },
                {
                    "component_name": "Search Results",
                    "step_number": 0,
                    "step_text": "",
                    "type": "display",
                    "parent": "Document Explorer Modal"
                },
                {
                    "component_name": "Document Metadata",
                    "step_number": 0,
                    "step_text": "",
                    "type": "display",
                    "parent": "Document Explorer Modal"
                },
                {
                    "component_name": "References",
                    "step_number": 0,
                    "step_text": "",
                    "type": "display",
                    "parent": "Document Explorer Modal"
                }
            ]
        },
        {
            "component_name": "Export Results",
            "step_number": 0,
            "step_text": "",
            "button_ID": "gcExportResults",
            "click_button": false,
            "type": "button"
        },
        {
            "component_name": "Open Selected Documents Drawer",
            "step_number": 0,
            "step_text": "Click here to open the side bar.",
            "button_ID": "gcOpenSelectedDocsDrawer",
            "click_button": true,
            "title": "Open the Selected Docs Menu",
            "type": "button"
        },
        {
            "component_name": "Search Result Checkbox",
            "step_number": 0,
            "step_text": "Select relevant results using the check box in the upper-right corner of each card. Checked results are listed in a side bar where they can be exported together.",
            "button_ID": "gcSearchResultCheckbox",
            "click_button": true,
            "title": "Search Result Checkboxes",
            "type": "button"
        },
        {
            "component_name": "Selected Documents Drawer",
            "step_number": 0,
            "step_text": "This menu lists all results selected, which can be exported together.",
            "type": "display",
            "prerequisite_component": "Open Export Selected",
            "title": "Selected Documents Menu",
            "placement": "auto",
            "click_back": true,
            "back_button_ID": "gcCloseSelectedDocs",
            "sub_components": [
                {
                    "component_name": "Export Selected Documents",
                    "step_number": 0,
                    "step_text": "Use this button to export selected documents",
                    "type": "button",
                    "button_ID": "gcExportSelectedDocs",
                    "title": "Export Selected Documents",
                    "click_button": true
                }
            ]
        },
        {
            "component_name": "Search Results Section",
            "step_number": 0,
            "step_text": "Explore your results through our Card View.",
            "type": "display",
            "prerequisite_component": "Search Bar",
            "title": "RESULTS",
            "sub_components": [
                {
                    "component_name": "Search Result Card",
                    "step_number": 5,
                    "step_text": "Cards are wider and provide more surrounding context to the highlighted word.",
                    "type": "display",
                    "parent": "Search Results Section",
                    "disableScrolling": true,
                    "placement": "right",
                    "test_B": true,
                    "title": "CARD"
                },
                {
                    "component_name": "Highlight Keyword",
                    "step_number": 0,
                    "step_text": "On the front of each card, we show you the snippet of text in which GAMECHANGER found your search term(s).",
                    "type": "display",
                    "parent": "Search Results Section",
                    "title": "SNIPPETS"
                },
                {
                	"component_name": "Panel Footer",
                	"step_number": 0,
                	"step_text": "Open, preview, or explore more data about this document to assess its relevance to your query.",
                	"type": "display",
                	"parent": "Search Results Section",
                	"title": "INTERACT"
                },
                {
                    "component_name": "Open",
                    "step_number": 0,
                    "step_text": "",
                    "type": "button",
                    "button_ID": "gcOpenDocument",
                    "click_button": false,
                    "parent": "Search Results Section"
                },
                {
                    "component_name": "Preview",
                    "step_number": 0,
                    "step_text": "",
                    "type": "button",
                    "button_ID": "gcPreviewDocument",
                    "click_button": false,
                    "parent": "Search Results Section"
                },
                {
                    "component_name": "More",
                    "step_number": 0,
                    "step_text": "",
                    "type": "button",
                    "button_ID": "gcMoreInfo",
                    "click_button": false,
                    "parent": "Search Results Section"
                }
            ]
        },
        {
            "component_name": "Export Results Modal",
            "step_number": 0,
            "step_text": "",
            "type": "display",
            "sub_components": 
            [
                {
                    "component_name": "Export File Settings",
                    "step_number": 0,
                    "step_text": "",
                    "type": "button",
                    "button_ID": "gcGenerateFile",
                    "click_button": false    ,
                    "parent": "Export Results Modal"        
                },
                {
                    "component_name": "Close Export Modal",
                    "step_number": 0,
                    "step_text": "",
                    "type": "button",
                    "button_ID": "gcCloseExportModal",
                    "click_button": false,
                    "parent": "Export Results Modal"
                }
            ]
        },
        {
            "component_name": "Crowd Assist",
            "step_number": 0,
            "step_text": "Click the Crowd Assist button to aid in the training of the Gamechanger models.",
            "button_ID": "gcCrowdAssistBtn",
            "click_button": true,
            "type": "button"
        },
        {
            "component_name": "Crowd Assist Modal",
            "step_number": 0,
            "step_text": "",
            "type": "display",
            "sub_components": [
                {
                    "component_name": "Crowd Assist Panel",
                    "step_number": 0,
                    "step_text": "This is the crowd assist panel. You can aid in the development of the NLP/ML models by taking time and tagging various paragraphs from random documents pulled from the document corpus.",
                    "type": "display",
                    "parent": "Crowd Assist Modal"
                },
                {
                    "component_name": "Paragraph Progress",
                    "step_number": 0,
                    "step_text": "This is the progress bar to track what paragraph you are on from the document. You do not have to tag all of them. This is just for reference.",
                    "type": "display",
                    "parent": "Crowd Assist Modal"
                },
                {
                    "component_name": "Tag Selection",
                    "step_number": 0,
                    "step_text": "Here you can select which tag to use when tagging text in the paragraph below.",
                    "type": "display",
                    "parent": "Crowd Assist Modal"
                },
                {
                    "component_name": "Paragraph to Tag",
                    "step_number": 0,
                    "step_text": "This is the area to tag text. Double-click on a word or highlight a few words to tag the word(s).",
                    "type": "display",
                    "parent": "Crowd Assist Modal"
                },
                {
                    "component_name": "Next Button",
                    "step_number": 0,
                    "step_text": "Clicking the next button will bring in a new paragraph to tag.",
                    "button_ID": "gcAssistNext",
                    "click_button": false,
                    "type": "button"
                },
                {
                    "component_name": "Previous Button",
                    "step_number": 0,
                    "step_text": "Clicking the previous button will move you back to the previous paragraph.",
                    "button_ID": "gcAssistPrevious",
                    "click_button": false,
                    "type": "button"
                },
                {
                    "component_name": "Save Button",
                    "step_number": 0,
                    "step_text": "Clicking the save button will save the tags to the database.",
                    "button_ID": "gcAssistSave",
                    "click_button": false,
                    "type": "button"
                },
                {
                    "component_name": "Close Button",
                    "step_number": 0,
                    "step_text": "Click the close button will close the assist panel.",
                    "button_ID": "gcAssistClose",
                    "click_button": true,
                    "type": "button"
                }
              ]
        },
        {
            "component_name": "List View",
            "step_number": 0,
            "step_text": "Click this button to switch to the list view.",
            "type": "button",
            "button_ID": "gcListView",
            "click_button": true,
            "title": "CARD",
            "test_B": true
        }
    ]
}';
    return x;
END
$$
LANGUAGE plpgsql;

insert into tutorial_overlays (app_name, current_tutorial_json, new_user_tutorial_json) values ('Gamechanger', gcCurrentTutorialJSON(), gcNewUserTutorialJSON());
