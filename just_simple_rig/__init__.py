import bpy, os, traceback
from bpy.props import BoolProperty, PointerProperty


class JustSimpleRigUI(bpy.types.Panel):
    bl_label = "Just Simple Rig"
    bl_idname = "VIEW3D_PT_just_simple_rig_ui"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'Just Simple Rig'
    bl_options = {'HIDE_HEADER'}

    @classmethod
    def poll(cls, context):
        obj = context.active_object
        return obj and obj.type == 'ARMATURE' and obj.data.get("Rig ID", "") == "Just Simple Rig"
    
    @staticmethod
    def settings_button(layout, data, prop_name: str, highlight=False, no_text=False, invert_arrow=False):
        is_expanded = getattr(data, prop_name)
        collapsed_arrow = 'TRIA_LEFT' if invert_arrow else 'TRIA_RIGHT'
        arrow = 'TRIA_DOWN' if is_expanded else collapsed_arrow
        
        layout.prop(data, prop_name, icon_only=no_text, icon=arrow, emboss=highlight)

    def _get_node_group_from_object(self, object_name: str, node_group_name: str):
        obj = next((obj for obj in bpy.data.objects if obj.parent == self.object_armature and obj.type == "MESH" and object_name in obj.name), None)
        
        if not obj:
            return None, f"{object_name} object not found"
        
        material = obj.material_slots[0].material
        if not material:
            return None, f"{object_name} material not found"
        
        if not material.node_tree:
            return None, f"{object_name} material has no node tree"

        node_group = next((node for node in material.node_tree.nodes if node.type == "GROUP" and node.node_tree and node_group_name in node.node_tree.name), None)
        if not node_group:
            return None, f"{object_name} node group not found"
        
        return node_group, ""
    
    @staticmethod
    def _get_node_inputs(node_group, input_names: list) -> dict:
        node_inputs = {}
        for input in input_names:
            if input in node_group.inputs:
                node_inputs[input] = node_group.inputs[input]

        return node_inputs

    def update_all_color_inputs(self) -> str:
        # Eyebrows
        node_group, error = self._get_node_group_from_object("Eyebrow", "Simplified Eyebrows")
        if error:
            return error
        
        eyebrow_color_names = [
            "R Eyebrow Color", "L Eyebrow Color"
        ]
        self.eyebrows_color_inputs = self._get_node_inputs(node_group, eyebrow_color_names)
        
        # Eyes
        node_group, error = self._get_node_group_from_object("Eye", "Simplified Math Eyes")
        if error:
            return error
        
        eye_color_names = [
            "R Eye", "L Eye",
            "R Iris", "L Iris",
            "R Pupil", "L Pupil",
            "R Spark", "L Spark"
        ]
        self.eye_color_inputs = self._get_node_inputs(node_group, eye_color_names)
        
        # Mouth
        node_group, error = self._get_node_group_from_object("Mouth", "Simplified Math Mouth")
        if error:
            return error
        
        mouth_color_names = [
            "Upper Teeth", "Lower Teeth", 
            "Closed Mouth Color", "Mouth", 
            "Tongue", "Tongue Color"
            ]
        self.mouth_color_inputs = self._get_node_inputs(node_group, mouth_color_names)
        
        return ""

    def show_error(self, error: str, detailed_error: str = ""):
        box = self.layout.box()
        box.scale_y = 1.4
        row = box.row()
        row.label(text=f"{error}", icon='ERROR')

        row = box.row()
        ds_link_op = row.operator("wm.url_open", text="Report to Aspirata's Discord Server", icon='URL')
        ds_link_op.url = "https://discord.gg/emBFTgjUrz"

        print(detailed_error)

    def draw(self, context):
        self.object_armature = context.active_object
        self.armature = self.object_armature.data
        self.ui_props = context.active_object.just_simple_rig_ui_props
        
        error = self.update_all_color_inputs()
        if error:
            self.show_error(error)
            return

        self.settings_bones = {n: self.object_armature.pose.bones[n] for n in (
            "General Settings", "Facial Settings",
            "L Arm Settings", "R Arm Settings",
            "L Leg Settings", "R Leg Settings"
        )}

        layout = self.layout

        try:
            self.draw_info_section(layout)
            self.draw_general_settings_section(layout)
            self.draw_facial_settings_section(layout)
            self.draw_limbs_settings_section(layout)
        except Exception as e:
            self.show_error(f"UI draw error: {e}", traceback.format_exc())

    def draw_info_section(self, layout):
        box = layout.box()
        row = box.row(align=True)
        self.settings_button(row, self.ui_props, 'info_expanded')
        if self.ui_props.info_expanded:
            box.label(text=f"Author: {self.armature['Author']}", icon='COMMUNITY')
            box.label(text=f"Rig ID: {self.armature['Rig ID']}", icon='ARMATURE_DATA')
            box.label(text=f"Version: {self.armature['Rig Version']}", icon='FILE_TICK')

    def draw_general_settings_section(self, layout):
        box = layout.box()
        row = box.row(align=True)
        self.settings_button(row, self.ui_props, 'general_settings_expanded')
        if self.ui_props.general_settings_expanded:
            row = box.row()
            row.prop(self.settings_bones["General Settings"], '["Render Bevel"]', text="Bevel")
            self.settings_button(row, self.ui_props, 'bevel_settings_expanded', True, True, True)
            if self.ui_props.bevel_settings_expanded:
                sbox = box.box()
                row = sbox.row()
                row.label(text="Bevel Settings:", icon='MOD_BEVEL')

                row = sbox.row()
                row.prop(self.settings_bones["General Settings"], '["Viewport Bevel"]', text="Display Bevel in Viewport")
                row.enabled = self.settings_bones["General Settings"]["Render Bevel"]

                row = sbox.row()
                row.prop(self.settings_bones["General Settings"], '["Bevel Amount"]')
                row.enabled = self.settings_bones["General Settings"]["Render Bevel"]

            row = box.row()
            row.prop(self.settings_bones["General Settings"], '["Advanced Bones"]')
            self.settings_button(row, self.ui_props, 'advanced_modes_expanded', True, True, True)
            if self.ui_props.advanced_modes_expanded:
                sbox = box.box()
                row = sbox.row()
                row.label(text="Advanced Bones:", icon='RESTRICT_VIEW_OFF')

                row = sbox.row()
                row.prop(self.settings_bones["Facial Settings"], '["Advanced Face"]', slider=True)
                row.enabled = self.settings_bones["General Settings"]["Advanced Bones"]

                row = sbox.row()
                row.prop(self.settings_bones["General Settings"], '["Advanced Body"]')
                row.enabled = self.settings_bones["General Settings"]["Advanced Bones"]

            row = box.row()
            row.prop(self.settings_bones["General Settings"], '["World Head"]')
            
            row = box.row()
            row.prop(self.object_armature, '["Display Properties"]')
            row.prop(self.settings_bones["General Settings"], '["Pixel Size 2x Fix"]')


    def draw_facial_settings_section(self, layout):
        box = layout.box()
        row = box.row(align=True)
        self.settings_button(row, self.ui_props, 'facial_settings_expanded')
        if self.ui_props.facial_settings_expanded:

            row = box.row()
            row.prop(self.settings_bones["Facial Settings"], '["Render Better 2D"]')
            
            # Eyebrows
            row = box.row()
            row.prop(self.settings_bones["Facial Settings"], '["Eyebrows"]')
            self.settings_button(row, self.ui_props, 'eyebrows_settings_expanded', True, True, True)
            if self.ui_props.eyebrows_settings_expanded:
                sbox = box.box()
                row = sbox.row()
                row.label(text="Eyebrows Colors:", icon='IMAGE')

                col = sbox.column(align=True)

                row1 = col.row(align=True)
                row1.prop(self.eyebrows_color_inputs["L Eyebrow Color"], 'default_value', text="")
                row1.prop(self.eyebrows_color_inputs["R Eyebrow Color"], 'default_value', text="")
                row1.enabled = self.settings_bones["Facial Settings"]["Eyebrows"]

            # Eyes
            row = box.row()
            row.prop(self.settings_bones["Facial Settings"], '["Eyes"]')
            self.settings_button(row, self.ui_props, 'eyes_settings_expanded', True, True, True)
            if self.ui_props.eyes_settings_expanded:
                sbox = box.box()
                row = sbox.row()
                row.label(text="Eyes Settings:", icon='MODIFIER_ON')

                tbox = sbox.box()
                row = tbox.row()
                row.label(text="Eyes and Iris Colors:", icon='IMAGE')
                
                col = tbox.column(align=True)
                
                row1 = col.row(align=True)
                row1.prop(self.eye_color_inputs["R Eye"], 'default_value', text="")
                row1.prop(self.eye_color_inputs["L Eye"], 'default_value', text="")
                row1.enabled = self.settings_bones["Facial Settings"]["Eyes"]

                row2 = col.row(align=True)
                row2.prop(self.eye_color_inputs["R Iris"], 'default_value', text="")
                row2.prop(self.eye_color_inputs["L Iris"], 'default_value', text="")
                row2.enabled = self.settings_bones["Facial Settings"]["Eyes"]

                row = sbox.row()
                row.prop(self.settings_bones["Facial Settings"], '["Pupils"]')
                self.settings_button(row, self.ui_props, 'pupils_settings_expanded', True, True, True)
                if self.ui_props.pupils_settings_expanded:
                    tbox = sbox.box()
                    row = tbox.row()
                    row.label(text="Pupils Colors:", icon='IMAGE')

                    col = tbox.column(align=True)

                    row1 = col.row(align=True)
                    row1.prop(self.eye_color_inputs["R Pupil"], 'default_value', text="")
                    row1.prop(self.eye_color_inputs["L Pupil"], 'default_value', text="")
                    row1.enabled = self.settings_bones["Facial Settings"]["Pupils"]

                row.enabled = self.settings_bones["Facial Settings"]["Eyes"]

                row = sbox.row()
                row.prop(self.settings_bones["Facial Settings"], '["Sparks"]')
                self.settings_button(row, self.ui_props, 'sparks_settings_expanded', True, True, True)
                if self.ui_props.sparks_settings_expanded:
                    tbox = sbox.box()
                    row = tbox.row()
                    row.label(text="Sparks Colors:", icon='IMAGE')

                    col = tbox.column(align=True)

                    row1 = col.row(align=True)
                    row1.prop(self.eye_color_inputs["R Spark"], 'default_value', text="")
                    row1.prop(self.eye_color_inputs["L Spark"], 'default_value', text="")
                    row1.enabled = self.settings_bones["Facial Settings"]["Sparks"]
                row.enabled = self.settings_bones["Facial Settings"]["Eyes"]

            # Mouth
            row = box.row()
            row.prop(self.settings_bones["Facial Settings"], '["Mouth"]')
            self.settings_button(row, self.ui_props, 'mouth_settings_expanded', True, True, True)
            if self.ui_props.mouth_settings_expanded:
                sbox = box.box()
                row = sbox.row()
                row.label(text="Mouth Settings:", icon='MODIFIER_ON')

                row = sbox.row()
                row.prop(self.settings_bones["Facial Settings"], '["Tongue"]', toggle=True)
                row.enabled = self.settings_bones["Facial Settings"]["Mouth"]

                col = sbox.column(align=True)

                row1 = col.row()
                row1.prop(self.mouth_color_inputs["Closed Mouth Color"], 'default_value', text="")
                row1.prop(self.mouth_color_inputs["Upper Teeth"], 'default_value', text="")
                row1.enabled = self.settings_bones["Facial Settings"]["Mouth"]

                row2 = col.row()
                row2.prop(self.mouth_color_inputs["Mouth"], 'default_value', text="")
                row2.prop(self.mouth_color_inputs["Lower Teeth"], 'default_value', text="")
                row2.enabled = self.settings_bones["Facial Settings"]["Mouth"]

                row = sbox.row()
                row.prop(self.mouth_color_inputs["Tongue Color"], 'default_value', text="")
                row.enabled = self.settings_bones["Facial Settings"]["Mouth"] and self.settings_bones["Facial Settings"]["Tongue"]

    def draw_limbs_settings_section(self, layout):
        box = layout.box()
        row = box.row(align=True)
        self.settings_button(row, self.ui_props, 'limbs_settings_expanded')
        if self.ui_props.limbs_settings_expanded:

            # Arms Settings
            sbox = box.box()
            row = sbox.row()
            row.label(text="Arms Settings:", icon='VIEW_PAN')
            self.settings_button(row, self.ui_props, 'arms_settings_expanded', True, True, True)
            if self.ui_props.arms_settings_expanded:
                row = sbox.row()
                row.prop(self.settings_bones["General Settings"], '["Alex Arms"]', toggle=True)
                col = sbox.column(align=True)

                row1 = col.row()
                row1.prop(self.settings_bones["R Arm Settings"], '["IK"]', slider=True)
                row1.prop(self.settings_bones["L Arm Settings"], '["IK"]', slider=True)
                
                row2 = col.row()
                row2_r = row2.row()
                row2_r.prop(self.settings_bones["R Arm Settings"], '["World IK"]', slider=True)
                row2_r.enabled = self.settings_bones["R Arm Settings"]["IK"] != 0

                row2_l = row2.row()
                row2_l.prop(self.settings_bones["L Arm Settings"], '["World IK"]', slider=True)
                row2_l.enabled = self.settings_bones["L Arm Settings"]["IK"] != 0

            # Legs Settings
            sbox = box.box()
            row = sbox.row()
            row.label(text="Legs Settings:", icon='BONE_DATA')
            self.settings_button(row, self.ui_props, 'legs_settings_expanded', True, True, True)
            if self.ui_props.legs_settings_expanded:
                col = sbox.column(align=True)

                row1 = col.row()
                row1_r = row1.row()
                row1_r.prop(self.settings_bones["R Leg Settings"], '["Knee"]', toggle=True)
                row1_r.enabled = self.settings_bones["R Leg Settings"]["IK"] != 0

                row1_l = row1.row()
                row1_l.prop(self.settings_bones["L Leg Settings"], '["Knee"]', toggle=True)
                row1_l.enabled = self.settings_bones["L Leg Settings"]["IK"] != 0

                row2 = col.row()
                row2_r = row2.row()
                row2_r.prop(self.settings_bones["R Leg Settings"], '["Stretch"]', toggle=True)
                row2_r.enabled = self.settings_bones["R Leg Settings"]["IK"] != 0

                row2_l = row2.row()
                row2_l.prop(self.settings_bones["L Leg Settings"], '["Stretch"]', toggle=True)
                row2_l.enabled = self.settings_bones["L Leg Settings"]["IK"] != 0

                row3 = col.row()
                row3.prop(self.settings_bones["R Leg Settings"], '["IK"]', slider=True)
                row3.prop(self.settings_bones["L Leg Settings"], '["IK"]', slider=True)


class JustSimpleRigAppend(bpy.types.Operator):
    bl_idname = "just_simple_rig.append_rig"
    bl_label = "Just Simple Rig"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        blend_file_path = next((os.path.join(current_dir, file) for file in os.listdir(current_dir) if file.endswith(".blend")), None)

        if not os.path.exists(blend_file_path):
            self.report({'ERROR'}, f"Rig File not found: {blend_file_path}")
            return {'CANCELLED'}
        
        try:
            with bpy.data.libraries.load(blend_file_path, link=False) as (data_from, data_to):
                data_to.collections = data_from.collections

            if not data_to.collections:
                self.report({'WARNING'}, "No collections found in file.")
                return {'CANCELLED'}

            just_simple_rig_collection = next((col for col in data_to.collections if "Just Simple Rig" in col.name), None)
            if not just_simple_rig_collection:
                self.report({'WARNING'}, 'Collection "Just Simple Rig" not found in file.')
                return {'CANCELLED'}
            
            # Append
            active_collection = context.view_layer.active_layer_collection.collection
            active_collection.children.link(just_simple_rig_collection)

            # Move Root Bone to 3D Cursor
            just_simple_armature = next((obj for obj in just_simple_rig_collection.objects if obj.type == 'ARMATURE'), None)
            cursor_location = bpy.context.scene.cursor.location
            just_simple_armature.pose.bones["Root"].matrix.translation = cursor_location

            self.report({'INFO'}, f"Collection '{just_simple_armature.name}' successfully added.")
            return {'FINISHED'}

        except Exception as e:
            self.report({'ERROR'}, f"Error appending rig: {e}")
            return {'CANCELLED'}


def add_just_simple_rig_menu(self, context):
    self.layout.operator(JustSimpleRigAppend.bl_idname, icon='ARMATURE_DATA')


# UI Properties
class JustSimpleRigUIProperties(bpy.types.PropertyGroup):
    info_expanded: BoolProperty(name="Info", default=True)
    general_settings_expanded: BoolProperty(name="General Settings", default=True)
    bevel_settings_expanded: BoolProperty(name="Bevel Settings", default=False)
    advanced_modes_expanded: BoolProperty(name="Advanced Modes", default=False)
    facial_settings_expanded: BoolProperty(name="Facial Settings", default=True)
    eyebrows_settings_expanded: BoolProperty(name="Eyebrows Settings", default=False)
    eyes_settings_expanded: BoolProperty(name="Eyes Settings", default=False)
    pupils_settings_expanded: BoolProperty(name="Pupils Settings", default=False)
    sparks_settings_expanded: BoolProperty(name="Sparks Settings", default=False)
    colored_eyelids_settings_expanded: BoolProperty(name="Colored Eyelids Settings", default=False)
    mouth_settings_expanded: BoolProperty(name="Mouth Settings", default=False)
    limbs_settings_expanded: BoolProperty(name="Limbs Settings", default=True)
    arms_settings_expanded: BoolProperty(name="Arms Settings", default=True)
    legs_settings_expanded: BoolProperty(name="Legs Settings", default=True)
    body_settings_expanded: BoolProperty(name="Body Settings", default=True)


classes = (
    JustSimpleRigUIProperties,
    JustSimpleRigUI,
    JustSimpleRigAppend,
)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)

    bpy.types.Object.just_simple_rig_ui_props = PointerProperty(type=JustSimpleRigUIProperties)

    menu_funcs = bpy.types.VIEW3D_MT_add._dyn_ui_initialize()
    for func in menu_funcs:
        if not hasattr(func, '__name__') or func.__name__ != 'add_just_simple_rig_menu':
            continue
        try:
            bpy.types.VIEW3D_MT_add.remove(func)
        except:
            pass

    bpy.types.VIEW3D_MT_add.append(add_just_simple_rig_menu)


def unregister():
    if hasattr(bpy.types.Object, 'just_simple_rig_ui_props'):
        del bpy.types.Object.just_simple_rig_ui_props

    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)


if __name__ == '__main__':
    register()